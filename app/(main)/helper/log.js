import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useState } from 'react';
import { GET } from '../../api/service/axios/route';
import { dateTemplate } from './date';
import { statusDetailTamplate } from './status';

export const Log = ({ id }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await GET(`/api/Logfiles/Filelogs_logdtl?Id=${id}`);
            if (res) {
                setResult(res);
            }
            setLoading(false);
        };
        fetchData();
    }, []);
    return (
        <DataTable
            value={result}
            rows={5}
            paginator
            loading={loading}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
            rowsPerPageOptions={[5, 10, 50]}
            filterDisplay="row"
            emptyMessage="No result found"
        >
            <Column field="LogMessage" header="File Status" />
            <Column field="FileName" header="File Name" />
            <Column field="StartDate" body={dateTemplate} header="Failed On" />
            <Column field="RecordStatus" header="Status" body={statusDetailTamplate}></Column>
        </DataTable>
    );
};
