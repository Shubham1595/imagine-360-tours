import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import * as xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import { syncLeadNextFollowUp } from '../utils/followupSync';
import { Prisma } from '@prisma/client';
import { parseLocationLink, isValidCoordinate } from '../utils/locationParser';
import { isWebsiteColumn, normalizeWebsiteUrl } from '../utils/urlParser';

export async function parseUploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded. Please upload a .csv, .xlsx or .xls file.' });
      return;
    }

    let rows: Record<string, any>[] = [];

    if (file.originalname.endsWith('.csv')) {
      const content = file.buffer.toString('utf-8');
      rows = parseCsv(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else {
      // Excel workbook
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    }

    if (!rows.length) {
      res.status(400).json({ success: false, error: 'The uploaded file is empty.' });
      return;
    }

    // Detected columns from first row
    const detectedColumns = Object.keys(rows[0]);

    // Intelligent default column mapping heuristics
    const suggestedMapping: Record<string, string> = {};
    for (const col of detectedColumns) {
      const lower = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.includes('name') || lower.includes('client') || lower.includes('customer')) {
        suggestedMapping[col] = 'name';
      } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('tel')) {
        suggestedMapping[col] = 'phone';
      } else if (lower.includes('email') || lower.includes('mail')) {
        suggestedMapping[col] = 'email';
      } else if (isWebsiteColumn(col)) {
        suggestedMapping[col] = 'website';
      } else if (lower.includes('company') || lower.includes('org') || lower.includes('business')) {
        suggestedMapping[col] = 'company';
      } else if (
        lower.includes('maplink') ||
        lower.includes('mapurl') ||
        lower.includes('locationlink') ||
        lower.includes('locationurl') ||
        lower.includes('googlemap') ||
        lower.includes('mapslink') ||
        lower.includes('addresslink') ||
        lower === 'map' ||
        lower === 'maps' ||
        lower === 'maplink' ||
        lower === 'location'
      ) {
        suggestedMapping[col] = 'map_url';
      } else if (lower === 'lat' || lower === 'latitude' || lower.startsWith('latitude')) {
        suggestedMapping[col] = 'latitude';
      } else if (lower === 'lng' || lower === 'lon' || lower === 'longitude' || lower.startsWith('longitude')) {
        suggestedMapping[col] = 'longitude';
      } else if (lower.includes('coordinate') || lower.includes('latlong') || lower.includes('latlng') || lower.includes('coords')) {
        suggestedMapping[col] = 'coordinates';
      } else if (lower.includes('address') || lower.includes('street')) {
        suggestedMapping[col] = 'address';
      } else if (lower.includes('city') || lower.includes('town') || lower.includes('district')) {
        suggestedMapping[col] = 'city';
      } else if (lower.includes('state') || lower.includes('province')) {
        suggestedMapping[col] = 'state';
      } else if (lower.includes('pincode') || lower.includes('postal') || lower.includes('zip') || lower === 'pin') {
        suggestedMapping[col] = 'pincode';
      } else if (lower.includes('service') || lower.includes('requirement') || lower.includes('product')) {
        suggestedMapping[col] = 'service';
      } else if (lower.includes('source') || lower.includes('channel') || lower.includes('origin')) {
        suggestedMapping[col] = 'source';
      } else if (lower.includes('temperature') || lower.includes('classification')) {
        suggestedMapping[col] = 'classification';
      } else if (lower.includes('stage') || lower.includes('salesstage')) {
        suggestedMapping[col] = 'stage';
      } else if (lower.includes('priority')) {
        suggestedMapping[col] = 'priority';
      } else if (lower.includes('dealvalue') || lower.includes('estimatedvalue') || lower.includes('estimateddealvalue') || lower.includes('deal')) {
        suggestedMapping[col] = 'estimated_deal_value';
      } else if (lower.includes('closingdate') || lower.includes('expectedclosing')) {
        suggestedMapping[col] = 'expected_closing_date';
      } else if (lower.includes('probability')) {
        suggestedMapping[col] = 'closing_probability';
      } else if (lower.includes('followup') || lower.includes('nextfollow') || lower.includes('followupdate')) {
        suggestedMapping[col] = 'next_follow_up_date';
      } else if (lower.includes('finalresult') || lower.includes('result')) {
        suggestedMapping[col] = 'final_result';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        filename: file.originalname,
        totalRows: rows.length,
        detectedColumns,
        suggestedMapping,
        previewRows: rows.slice(0, 5),
        rawRows: rows, // cached for preview step
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function validateImportRows(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows, mapping } = req.body; // mapping: { "Original Column": "standardField" }

    if (!Array.isArray(rows) || !mapping) {
      res.status(400).json({ success: false, error: 'Rows and mapping configuration are required.' });
      return;
    }

    // Existing phone numbers and emails in database for duplicate detection
    const existingCustomers = await prisma.customer.findMany({
      select: { phone: true, email: true },
    });
    const existingPhones = new Set(existingCustomers.map(c => c.phone.trim().replace(/\D/g, '')));
    const existingEmails = new Set(
      existingCustomers.filter(c => c.email).map(c => c.email!.toLowerCase().trim())
    );

    const validRows: any[] = [];
    const duplicates: any[] = [];
    const invalidRows: any[] = [];

    // Track duplicates within the uploaded batch itself
    const seenBatchPhones = new Set<string>();

    rows.forEach((rawRow: any, index: number) => {
      const rowNum = index + 2; // considering 1-based header row
      const mapped: Record<string, any> = {};

      for (const [fileCol, stdField] of Object.entries(mapping)) {
        if (stdField && rawRow[fileCol] !== undefined) {
          mapped[stdField as string] = String(rawRow[fileCol]).trim();
        }
      }

      // Fallback: If website was not explicitly mapped but rawRow has a website column variation
      if (!mapped.website) {
        for (const key of Object.keys(rawRow)) {
          if (isWebsiteColumn(key) && rawRow[key] !== undefined && rawRow[key] !== null) {
            mapped.website = String(rawRow[key]).trim();
            break;
          }
        }
      }

      // 1. Validation checks
      if (!mapped.name) {
        invalidRows.push({ rowNumber: rowNum, data: rawRow, reason: 'Customer name is missing' });
        return;
      }

      if (!mapped.phone || mapped.phone.length < 8) {
        invalidRows.push({ rowNumber: rowNum, data: rawRow, reason: 'Invalid or missing phone number' });
        return;
      }

      if (mapped.email && !/\S+@\S+\.\S+/.test(mapped.email)) {
        invalidRows.push({ rowNumber: rowNum, data: rawRow, reason: `Malformed email: ${mapped.email}` });
        return;
      }

      // Cleaned phone digits for comparison
      const cleanPhone = mapped.phone.replace(/\D/g, '');

      // 2. Duplicate checks
      if (existingPhones.has(cleanPhone) || (mapped.email && existingEmails.has(mapped.email.toLowerCase()))) {
        duplicates.push({ rowNumber: rowNum, data: mapped, reason: 'Matches existing customer in database' });
        return;
      }

      if (seenBatchPhones.has(cleanPhone)) {
        duplicates.push({ rowNumber: rowNum, data: mapped, reason: 'Duplicate phone within the same import file' });
        return;
      }

      seenBatchPhones.add(cleanPhone);
      validRows.push({ rowNumber: rowNum, data: mapped });
    });

    res.status(200).json({
      success: true,
      data: {
        total: rows.length,
        validCount: validRows.length,
        duplicateCount: duplicates.length,
        invalidCount: invalidRows.length,
        validSample: validRows.slice(0, 10),
        duplicateSample: duplicates.slice(0, 10),
        invalidSample: invalidRows.slice(0, 10),
        summary: `Total: ${rows.length} | Valid: ${validRows.length} | Duplicates: ${duplicates.length} | Invalid: ${invalidRows.length}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function executeImport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { filename, validRecords, duplicates, invalidRecords } = req.body;

    if (!Array.isArray(validRecords)) {
      res.status(400).json({ success: false, error: 'Valid records payload is required.' });
      return;
    }

    const adminId = req.user?.id;

    // 1. Create Import Batch Record
    const batch = await prisma.importBatch.create({
      data: {
        filename: filename || 'import_leads.csv',
        uploaded_by: adminId || null,
        total_records: validRecords.length + (duplicates?.length || 0) + (invalidRecords?.length || 0),
        successful_records: 0,
        duplicate_records: duplicates?.length || 0,
        failed_records: invalidRecords?.length || 0,
      },
    });

    // 2. Insert Import Errors for invalid and duplicate rows
    const errorRecordsToCreate: any[] = [];
    if (Array.isArray(invalidRecords)) {
      for (const inv of invalidRecords) {
        errorRecordsToCreate.push({
          batch_id: batch.id,
          row_number: inv.rowNumber || 0,
          raw_data: JSON.stringify(inv.data || {}),
          error_message: inv.reason || 'Invalid data structure',
        });
      }
    }
    if (Array.isArray(duplicates)) {
      for (const dup of duplicates) {
        errorRecordsToCreate.push({
          batch_id: batch.id,
          row_number: dup.rowNumber || 0,
          raw_data: JSON.stringify(dup.data || {}),
          error_message: dup.reason || 'Duplicate record identified',
        });
      }
    }

    if (errorRecordsToCreate.length > 0) {
      await prisma.importError.createMany({
        data: errorRecordsToCreate,
      });
    }

    // 3. Insert valid customers and their associated leads
    let successCount = 0;

    for (const item of validRecords) {
      const row = item.data || item;
      try {
        // Resolve location data safely
        let rowLat: number | null = null;
        let rowLng: number | null = null;
        const rowMapUrl: string | null = (row.map_url || row.map_link || row.location_link || row.location_url || row.google_maps_link || row.google_map || null)?.trim() || null;

        if (row.latitude !== undefined && row.latitude !== '' && row.latitude !== null) {
          const parsedLat = parseFloat(String(row.latitude));
          if (!isNaN(parsedLat)) rowLat = parsedLat;
        }
        if (row.longitude !== undefined && row.longitude !== '' && row.longitude !== null) {
          const parsedLng = parseFloat(String(row.longitude));
          if (!isNaN(parsedLng)) rowLng = parsedLng;
        }

        if (row.coordinates) {
          const parsedCoord = parseLocationLink(String(row.coordinates));
          if (parsedCoord.isValidCoordinates) {
            if (rowLat === null) rowLat = parsedCoord.latitude;
            if (rowLng === null) rowLng = parsedCoord.longitude;
          }
        }

        if (rowMapUrl) {
          const parsedUrl = parseLocationLink(rowMapUrl);
          if (parsedUrl.isValidCoordinates) {
            if (rowLat === null) rowLat = parsedUrl.latitude;
            if (rowLng === null) rowLng = parsedUrl.longitude;
          }
        }

        // Validate coordinates: reject if out of bounds (-90..90, -180..180)
        if (rowLat !== null || rowLng !== null) {
          if (!isValidCoordinate(rowLat, rowLng)) {
            await prisma.importError.create({
              data: {
                batch_id: batch.id,
                row_number: item.rowNumber || 0,
                raw_data: JSON.stringify(row),
                error_message: `Invalid coordinates rejected (lat: ${rowLat}, lng: ${rowLng}). Customer imported without coordinates.`,
              },
            });
            rowLat = null;
            rowLng = null;
          }
        }

        // Resolve website URL safely
        let rawWebsite = row.website;
        if (rawWebsite === undefined || rawWebsite === null) {
          for (const key of Object.keys(row)) {
            if (isWebsiteColumn(key) && row[key] !== undefined && row[key] !== null) {
              rawWebsite = row[key];
              break;
            }
          }
        }

        let rowWebsite: string | null = null;
        if (rawWebsite !== undefined && rawWebsite !== null && String(rawWebsite).trim() !== '') {
          const trimmedWebsite = String(rawWebsite).trim();
          const parsedUrl = normalizeWebsiteUrl(trimmedWebsite);
          if (parsedUrl.isValid) {
            rowWebsite = parsedUrl.url;
          } else {
            await prisma.importError.create({
              data: {
                batch_id: batch.id,
                row_number: item.rowNumber || 0,
                raw_data: JSON.stringify(row),
                error_message: parsedUrl.warning || `Invalid website URL '${trimmedWebsite}'. Customer imported with website set to null.`,
              },
            });
            rowWebsite = null;
          }
        }

        // Check if customer already exists (prevent duplicate customers)
        let customer = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone: row.phone },
              ...(row.email ? [{ email: row.email }] : []),
            ],
          },
        });

        if (customer) {
          // Merge location info, DO NOT overwrite existing valid location with null
          const updateData: Prisma.CustomerUpdateInput = {};
          if (row.address && !customer.address) updateData.address = row.address;
          if (row.city && !customer.city) updateData.city = row.city;
          if (row.state && !customer.state) updateData.state = row.state;
          if (row.pincode && !customer.pincode) updateData.pincode = row.pincode;
          if (rowWebsite && !customer.website) updateData.website = rowWebsite;
          if (rowMapUrl && rowMapUrl.length > 0) {
            updateData.map_url = rowMapUrl;
          }
          if (rowLat !== null && rowLat !== undefined) {
            updateData.latitude = rowLat;
          }
          if (rowLng !== null && rowLng !== undefined) {
            updateData.longitude = rowLng;
          }
          if (Object.keys(updateData).length > 0) {
            customer = await prisma.customer.update({
              where: { id: customer.id },
              data: updateData,
            });
          }
        } else {
          customer = await prisma.customer.create({
            data: {
              name: row.name,
              phone: row.phone,
              email: row.email || null,
              company: row.company || null,
              website: rowWebsite,
              city: row.city || null,
              state: row.state || null,
              pincode: row.pincode || null,
              address: row.address || null,
              latitude: rowLat,
              longitude: rowLng,
              map_url: rowMapUrl,
              source: row.source || 'Batch Import',
              assigned_to: adminId || null,
            },
          });
        }

        // Resolve service
        let serviceId = null;
        if (row.service) {
          const match = await prisma.service.findFirst({
            where: { name: { contains: row.service } },
          });
          if (match) serviceId = match.id;
        }

        // Resolve classification
        let leadClassification: any = 'WARM';
        if (row.classification) {
          const normClass = String(row.classification).toUpperCase().trim();
          if (['COLD', 'WARM', 'HOT'].includes(normClass)) {
            leadClassification = normClass;
          }
        }

        // Resolve sales sub-stage
        let leadStage: any = 'LEAD_CAPTURED';
        if (row.stage) {
          const normStage = String(row.stage).toUpperCase().replace(/[^A-Z]/g, '_').trim();
          if (['LEAD_CAPTURED', 'INITIAL_CONTACT', 'NEEDS_ANALYSIS', 'QUOTATION_SENT', 'NEGOTIATION', 'VERBAL_COMMITMENT', 'CLOSED_WON', 'CLOSED_LOST'].includes(normStage)) {
            leadStage = normStage;
          } else if (normStage.includes('CAPTURE')) leadStage = 'LEAD_CAPTURED';
          else if (normStage.includes('CONTACT')) leadStage = 'INITIAL_CONTACT';
          else if (normStage.includes('NEED') || normStage.includes('ANALYSIS')) leadStage = 'NEEDS_ANALYSIS';
          else if (normStage.includes('QUOT') || normStage.includes('PROPOSAL')) leadStage = 'QUOTATION_SENT';
          else if (normStage.includes('NEGOTIAT')) leadStage = 'NEGOTIATION';
          else if (normStage.includes('VERBAL') || normStage.includes('COMMIT')) leadStage = 'VERBAL_COMMITMENT';
          else if (normStage.includes('WON')) leadStage = 'CLOSED_WON';
          else if (normStage.includes('LOST')) leadStage = 'CLOSED_LOST';
        }

        let leadPriority: any = 'MEDIUM';
        if (row.priority) {
          const normPri = String(row.priority).toUpperCase().trim();
          if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(normPri)) {
            leadPriority = normPri;
          }
        }

        const dealVal = row.estimated_deal_value ? parseFloat(String(row.estimated_deal_value).replace(/[^0-9.]/g, '')) : null;
        const prob = row.closing_probability ? parseInt(String(row.closing_probability).replace(/[^0-9]/g, ''), 10) : 50;
        const closingDate = row.expected_closing_date ? new Date(row.expected_closing_date) : null;

        // Create initial lead with CRM v2 hierarchy
        const createdLead = await prisma.lead.create({
          data: {
            customer_id: customer.id,
            service_id: serviceId,
            status: leadClassification,
            classification: leadClassification,
            stage: leadStage,
            priority: leadPriority,
            estimated_deal_value: isNaN(dealVal as number) ? null : dealVal,
            closing_probability: isNaN(prob) ? 50 : prob,
            expected_closing_date: closingDate && !isNaN(closingDate.getTime()) ? closingDate : null,
            final_result: row.final_result || null,
            source: row.source || `Import: ${batch.filename}`,
            notes: `Imported via batch ${batch.id}. Interested in: ${row.service || 'Spatial Technology Services'}`,
          },
        });

        // If next follow-up date is supplied, create pending follow-up
        const followUpDateStr = row.next_follow_up_date || row.follow_up_date;
        if (followUpDateStr) {
          const parsedDate = new Date(followUpDateStr);
          if (!isNaN(parsedDate.getTime())) {
            await prisma.followUp.create({
              data: {
                customer_id: customer.id,
                lead_id: createdLead.id,
                assigned_to: adminId || null,
                type: leadClassification === 'HOT' ? 'PROJECT_DISCUSSION' : 'GENERAL_FOLLOW_UP',
                purpose: 'Scheduled Follow-Up from Import',
                scheduled_date: parsedDate,
                scheduled_time: row.next_follow_up_time || '11:00 AM',
                reason: 'Imported schedule',
                status: 'PENDING',
              },
            });
            await syncLeadNextFollowUp(createdLead.id);
          }
        }

        successCount++;
      } catch (err: any) {
        await prisma.importError.create({
          data: {
            batch_id: batch.id,
            row_number: item.rowNumber || 0,
            raw_data: JSON.stringify(row),
            error_message: err.message || 'Database insertion error',
          },
        });
      }
    }

    // 4. Update Batch status
    const finalBatch = await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        successful_records: successCount,
        failed_records: (invalidRecords?.length || 0) + (validRecords.length - successCount),
      },
    });

    await logAudit({
      userId: adminId,
      action: 'LEADS_IMPORTED',
      entityType: 'ImportBatch',
      entityId: batch.id,
      metadata: {
        filename: batch.filename,
        successful: successCount,
        duplicates: duplicates?.length || 0,
        failed: finalBatch.failed_records,
      },
    });

    res.status(200).json({
      success: true,
      message: `Batch import complete. Successfully imported ${successCount} customers and leads.`,
      data: finalBatch,
    });
  } catch (error) {
    next(error);
  }
}

export async function getImportBatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const batches = await prisma.importBatch.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    next(error);
  }
}

export async function getImportBatchErrors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const [batch, errors] = await Promise.all([
      prisma.importBatch.findUnique({
        where: { id },
        include: { uploader: { select: { name: true } } },
      }),
      prisma.importError.findMany({
        where: { batch_id: id },
        orderBy: { row_number: 'asc' },
      }),
    ]);

    if (!batch) {
      res.status(404).json({ success: false, error: 'Import batch not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        batch,
        errors,
      },
    });
  } catch (error) {
    next(error);
  }
}
