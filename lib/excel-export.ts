import * as XLSX from 'xlsx';
import { CIMARA_SITES } from './constants';

interface WithdrawalData {
  _id: string;
  withdrawalDate: string;
  engineerName: string;
  siteName: string;
  receiverName: string;
  senderName: string;
  receiptNumber: string;
  items: Array<{
    equipmentName: string;
    quantityWithdrawn: number;
    unit: string;
  }>;
}

export function exportWithdrawalsByMultipleSites(
  withdrawals: WithdrawalData[],
  startDate: string,
  endDate: string
) {
  const workbook = XLSX.utils.book_new();

  // Create a summary sheet
  const summaryData = CIMARA_SITES.map((site) => {
    const siteWithdrawals = withdrawals.filter((w) => w.siteName === site);
    const totalItems = siteWithdrawals.reduce(
      (sum, w) => sum + w.items.reduce((itemSum, item) => itemSum + item.quantityWithdrawn, 0),
      0
    );

    return {
      Site: site,
      'Total Withdrawals': siteWithdrawals.length,
      'Total Items Withdrawn': totalItems,
      'Engineers': [...new Set(siteWithdrawals.map((w) => w.engineerName))].join(', '),
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Create a sheet for each site
  CIMARA_SITES.forEach((site) => {
    const siteWithdrawals = withdrawals.filter((w) => w.siteName === site);

    const sheetData = siteWithdrawals.map((withdrawal) => {
      const items = withdrawal.items.map((item, idx) => ({
        'Receipt #': idx === 0 ? withdrawal.receiptNumber : '',
        Date: idx === 0 ? new Date(withdrawal.withdrawalDate).toLocaleDateString() : '',
        Engineer: idx === 0 ? withdrawal.engineerName : '',
        'Receiver': idx === 0 ? withdrawal.receiverName : '',
        'Sender': idx === 0 ? withdrawal.senderName : '',
        Equipment: item.equipmentName,
        Quantity: item.quantityWithdrawn,
        Unit: item.unit,
      }));
      return items;
    });

    const flatData = sheetData.flat();
    const sheet = XLSX.utils.json_to_sheet(flatData);
    sheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, site);
  });

  XLSX.writeFile(
    workbook,
    `CIMARA_Withdrawals_${startDate}_to_${endDate}.xlsx`
  );
}
