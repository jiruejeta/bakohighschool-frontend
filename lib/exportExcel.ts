import * as XLSX from 'xlsx';

interface StudentCredentialRow {
  name: string;
  username: string;
  password: string;
}

export function exportStudentCredentialsToExcel(
  className: string,
  rows: StudentCredentialRow[]
) {
  const worksheetData = rows.map((row) => ({
    'Full Name': row.name,
    Class: className,
    Username: row.username,
    Password: row.password,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  worksheet['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 20 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Credentials');

  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `${safeClassName}_student_credentials.xlsx`);
}