export const statusDetailTamplate = (rowData) => {
    let statusDetail = '';
    if (rowData.RecordStatus === 3) {
        statusDetail = <span className="customer-badge status-qualified">Successful</span>;
    }
    if (rowData.RecordStatus === 2) {
        statusDetail = <span className="customer-badge status-unqualified">Not Successful</span>;
    }

    return <span>{statusDetail}</span>;
};
export const statuses = [
    { name: 'Not_Successful', value: 2, styl: 'unqualified' },
    { name: 'Successful', value: 3, styl: 'qualified' }
];
