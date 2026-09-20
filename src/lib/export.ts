import * as XLSX from 'xlsx';
import { OpportunityComplete, Agency, FollowUp, VerificationItem } from '../types/database';

function downloadFile(content: string | ArrayBuffer, fileName: string, contentType: string) {
  const blob = content instanceof ArrayBuffer ? new Blob([content], { type: contentType }) : new Blob([content], { type: contentType + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToCSV(items: Record<string, any>[]): string {
  if (items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const csvRows = [
    headers.join(','),
    ...items.map(row =>
      headers
        .map(header => {
          const val = row[header];
          if (val === null || val === undefined) return '""';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
  ];
  return csvRows.join('\r\n');
}

export function exportOpportunitiesCSV(opportunities: OpportunityComplete[]) {
  const rows = opportunities.map(o => {
    const itemizedTotal = o.costs ? (
      (o.costs.agency_service_charge || 0) +
      (o.costs.government_processing_fee || 0) +
      (o.costs.medical_exam || 0) +
      (o.costs.insurance || 0) +
      (o.costs.visa_fee || 0) +
      (o.costs.documentation || 0) +
      (o.costs.translation || 0) +
      (o.costs.training || 0) +
      (o.costs.air_ticket || 0) +
      (o.costs.miscellaneous || 0)
    ) : 0;
    const quotedTotal = o.costs?.total_quoted_cost || 0;
    const unaccountedDiff = quotedTotal - itemizedTotal;

    return {
      'Opportunity ID': o.id,
      'Agency Name': o.agency?.name || '',
      'Agency Location': o.agency?.location || '',
      'Country': o.country,
      'Job Title': o.job_title,
      'Job Sector': o.job_sector || '',
      'Employer Name': o.employer_name || '',
      'Employer City': o.employer_city || '',
      'Advertised Salary': o.advertised_salary || '',
      'Salary Currency': o.salary_currency,
      'Salary Type': o.salary_type || '',
      'Expected Net Salary': o.expected_net_salary || '',
      'Net Currency': o.net_salary_currency,
      'Working Hours': o.working_hours || '',
      'Working Days': o.working_days || '',
      'Overtime': o.overtime_status || '',
      'Overtime Rate': o.overtime_rate || '',
      'Accommodation': o.accommodation_type || '',
      'Monthly Accom. Cost': o.accommodation_cost || '',
      'Food': o.food_arrangement || '',
      'Transportation': o.transportation || '',
      'Quoted Total (NPR)': quotedTotal,
      'Itemized Total (NPR)': itemizedTotal,
      'Unaccounted Difference (NPR)': unaccountedDiff,
      'Work Permit Status': o.work_permit_status || '',
      'Estimated Processing': o.estimated_total_processing_time || '',
      'Timeline Basis': o.timeline_basis || '',
      'Evidence Status': o.evidence_status || '',
      'Pressure Flags': (o.pressure_flags || []).join('; '),
      'Visit Date': o.visit?.visit_date || '',
      'Created At': o.created_at
    };
  });

  const csv = convertToCSV(rows);
  downloadFile(csv, `manpower_opportunities_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportAgenciesCSV(agencies: Agency[]) {
  const rows = agencies.map(a => ({
    'Agency ID': a.id,
    'Name': a.name,
    'Location': a.location || '',
    'Phone': a.phone || '',
    'Contact Person': a.contact_person || '',
    'License Number': a.license_number || '',
    'Website': a.website || '',
    'Social Link': a.social_link || '',
    'Notes': a.notes || '',
    'Created At': a.created_at
  }));
  const csv = convertToCSV(rows);
  downloadFile(csv, `manpower_agencies_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportExcel(opportunities: OpportunityComplete[], agencies: Agency[], followUps: FollowUp[]) {
  const wb = XLSX.utils.book_new();

  // 1. Opportunities Sheet
  const oppRows = opportunities.map(o => ({
    'Agency': o.agency?.name || '',
    'Country': o.country,
    'Job Title': o.job_title,
    'Sector': o.job_sector || '',
    'Employer': o.employer_name || '',
    'Gross Salary': `${o.advertised_salary || '-'} ${o.salary_currency}`,
    'Expected Net': `${o.expected_net_salary || '-'} ${o.net_salary_currency}`,
    'Quoted Cost (NPR)': o.costs?.total_quoted_cost || 0,
    'Itemized Cost (NPR)': o.costs ? (
      (o.costs.agency_service_charge || 0) +
      (o.costs.government_processing_fee || 0) +
      (o.costs.medical_exam || 0) +
      (o.costs.insurance || 0) +
      (o.costs.visa_fee || 0) +
      (o.costs.documentation || 0) +
      (o.costs.translation || 0) +
      (o.costs.training || 0) +
      (o.costs.air_ticket || 0) +
      (o.costs.miscellaneous || 0)
    ) : 0,
    'Accommodation': o.accommodation_type || '',
    'Food': o.food_arrangement || '',
    'Permit Status': o.work_permit_status || '',
    'Processing Time': o.estimated_total_processing_time || '',
    'Evidence Status': o.evidence_status || ''
  }));
  const wsOpps = XLSX.utils.json_to_sheet(oppRows);
  XLSX.utils.book_append_sheet(wb, wsOpps, 'Opportunities');

  // 2. Costs Breakdown Sheet
  const costRows = opportunities.map(o => ({
    'Agency': o.agency?.name || '',
    'Country': o.country,
    'Job Title': o.job_title,
    'Service Charge': o.costs?.agency_service_charge || 0,
    'Govt Processing': o.costs?.government_processing_fee || 0,
    'Medical': o.costs?.medical_exam || 0,
    'Insurance': o.costs?.insurance || 0,
    'Visa Fee': o.costs?.visa_fee || 0,
    'Documentation': o.costs?.documentation || 0,
    'Translation': o.costs?.translation || 0,
    'Air Ticket': o.costs?.air_ticket || 0,
    'Miscellaneous': o.costs?.miscellaneous || 0,
    'Total Quoted': o.costs?.total_quoted_cost || 0,
    'Breakdown Status': o.costs?.cost_breakdown_status || '',
    'Written Total': o.costs?.written_cost ? 'Yes' : 'No'
  }));
  const wsCosts = XLSX.utils.json_to_sheet(costRows);
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs');

  // 3. Agencies Sheet
  const agencyRows = agencies.map(a => ({
    'Agency Name': a.name,
    'Location': a.location || '',
    'Phone': a.phone || '',
    'Contact Person': a.contact_person || '',
    'License Number': a.license_number || '',
    'Website': a.website || ''
  }));
  const wsAgencies = XLSX.utils.json_to_sheet(agencyRows);
  XLSX.utils.book_append_sheet(wb, wsAgencies, 'Agencies');

  // 4. Follow-ups Sheet
  const followUpRows = followUps.map(f => ({
    'Action': f.action,
    'Due Date': f.follow_up_date,
    'Status': f.status,
    'Notes': f.notes || '',
    'Opportunity ID': f.opportunity_id
  }));
  const wsFollowUps = XLSX.utils.json_to_sheet(followUpRows);
  XLSX.utils.book_append_sheet(wb, wsFollowUps, 'Follow-ups');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadFile(
    wbout,
    `manpower_research_complete_${new Date().toISOString().split('T')[0]}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

export function exportCompleteDatasetJSON(data: {
  agencies: Agency[];
  opportunities: OpportunityComplete[];
  followUps: FollowUp[];
  exportedAt: string;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(
    jsonStr,
    `manpower_research_dataset_${new Date().toISOString().split('T')[0]}.json`,
    'application/json'
  );
}
