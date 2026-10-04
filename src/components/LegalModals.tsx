import React from 'react';
import { Modal } from './Modal';
import { COMPANY_INFO } from '../data/company';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      subtitle="DATA PROTECTION & SPATIAL INTELLECTUAL PROPERTY"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm text-[#9BA3AE] leading-relaxed">
        <p>
          <strong className="text-white">1. Overview:</strong> Imagine 360 Tours respects your privacy and is committed to protecting client project telemetry, contact information, and proprietary spatial data gathered during 360° virtual tours, drone surveys, or software installations.
        </p>
        <p>
          <strong className="text-white">2. Information Collection:</strong> When commissioning a project or requesting an inquiry, we collect your name, phone number, email address, organization, and project location details solely for the purpose of communicating and preparing spatial deliverables.
        </p>
        <p>
          <strong className="text-white">3. Spatial & Aerial Data Ownership:</strong> Raw 360° panoramas, point clouds, BIM files, and CAD drawings captured for clients remain the intellectual and commercial property of the client upon settlement of contractual deliverables. We do not distribute private spatial models without prior written consent.
        </p>
        <p>
          <strong className="text-white">4. Third-Party Sharing:</strong> We do not sell or monetize personal or commercial contact information. Data is shared with third-party service providers (such as hosting infrastructure or payment processors) only to the extent necessary to deliver the agreed-upon digital services.
        </p>
        <p>
          <strong className="text-white">5. Contact:</strong> For any privacy inquiries, reach our Pune office at <a href={`mailto:${COMPANY_INFO.email}`} className="text-[#00F2FE] underline">{COMPANY_INFO.email}</a>.
        </p>
      </div>
    </Modal>
  );
};

export const TermsModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      subtitle="CLIENT ENGAGEMENT & PRODUCTION AGREEMENT"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm text-[#9BA3AE] leading-relaxed">
        <p>
          <strong className="text-white">1. Scope of Services:</strong> Imagine 360 Tours provides high-fidelity 360° virtual tours, aerial drone capture, 3D architectural rendering, digital twin reconstructions, and software SaaS systems as agreed in individualized client statements of work (SOW).
        </p>
        <p>
          <strong className="text-white">2. Site Access & Airspace Clearances:</strong> Clients are responsible for providing unobstructed access to physical premises on scheduled capture dates. For drone operations, flights are subject to DGCA regulations and weather safety conditions.
        </p>
        <p>
          <strong className="text-white">3. Turnaround Times:</strong> Turnaround schedules (typically 3-14 business days depending on tier) begin upon completion of on-site capture and receipt of necessary CAD/architectural assets from the client.
        </p>
        <p>
          <strong className="text-white">4. Payment & Taxation:</strong> All quoted service charges are subject to applicable GST under Indian tax regulations.
        </p>
        <p>
          <strong className="text-white">5. Governing Law:</strong> These terms shall be governed in accordance with the laws of Maharashtra, India, with jurisdiction in Pune.
        </p>
      </div>
    </Modal>
  );
};

export const AccessibilityModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accessibility Statement"
      subtitle="INCLUSIVE SPATIAL & WEB EXPERIENCES"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm text-[#9BA3AE] leading-relaxed">
        <p>
          Imagine 360 Tours strives to ensure our web platforms and spatial interfaces are accessible to all users, adhering to WCAG 2.1 Level AA standards.
        </p>
        <ul className="space-y-2 list-disc list-inside text-white/90">
          <li><strong>Keyboard Navigability:</strong> All interactive elements, project cards, and form inputs can be navigated via keyboard controls.</li>
          <li><strong>Prefers Reduced Motion:</strong> High-speed animations and Three.js 3D auto-rotations gracefully honor user system accessibility preferences.</li>
          <li><strong>High Contrast Typography:</strong> Dark mode typography features strict contrast ratios against deep background surfaces.</li>
          <li><strong>Screen Reader Semantic Tags:</strong> Structural HTML5 elements with descriptive ARIA labels facilitate assistive technology.</li>
        </ul>
      </div>
    </Modal>
  );
};
