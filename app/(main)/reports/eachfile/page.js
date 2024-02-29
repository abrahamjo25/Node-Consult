'use client';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import React, { useState, useEffect } from 'react';
import { GET } from '../../../api/service/axios/route';
import DataLoader from '../../dataLoader/page';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Page = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [result, setResult] = useState(null);
    const [countries, setCountries] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);

    const [reportDialog, setReportDialog] = useState(false);
    const columnCount = 4; // Number of columns
    const columnWidth = 100 / columnCount; // Calculate the width of each column dynamically
    const router = useRouter();
    useEffect(() => {
        fetchData();
    }, []);
    async function fetchData() {
        setLoading(true);
        try {
            const data = await GET('/api/Connections/Getdata');
            setData(data);
        } catch (err) {
            toast.error('Error ' + err?.message);
        } finally {
            setLoading(false);
        }
    }

    const hideDialog = () => {
        setResult(null);
        setReportDialog(false);
    };
    const getCountries = async (FileType) => {
        setDialogLoading(true);
        try {
            const data = await GET(`/api/Schedules/GetbyFileTypes?FileType=${FileType}`);
            setCountries(data);
        } catch (err) {
            toast.error('Error ' + err?.message);
        } finally {
            setDialogLoading(false);
        }
    };
    const reportData = async (rowData) => {
        setReportDialog(true);
        setResult({ ...rowData });
        await getCountries(rowData?.FileType);
    };

    const reportBodyTemplate = (data) => {
        return <i className="pi pi-chart-bar text-primary" onClick={() => reportData(data)} />;
    };

    const reportHeader = <p className="text-center">Choose Tape name for {result?.FileType}</p>;
    const showReport = (country) => {
        router.push(`/reports/fileparse?fileType=${result?.FileType}&country=${country}`);
    };
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );
    const rowCount = (rowData, props) => {
        let index = parseInt(props.rowIndex + 1, 10);
        return (
            <React.Fragment>
                <span>{index}</span>
            </React.Fragment>
        );
    };
    const columns = [
        { field: 'FileType', header: 'File Type' },
        { field: 'Domain', header: 'Domain' }
    ];
    return (
        <div className="col-12 xl:col-12">
            <div className="card">
                {loading ? (
                    <DataLoader />
                ) : (
                    <>
                        <h5 className="m-0">Reports</h5>
                        <DataTable
                            value={data}
                            rows={7}
                            paginator
                            className="datatable-responsive py-2"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                            rowsPerPageOptions={[7, 20, 50]}
                            header={header}
                            globalFilter={globalFilter}
                        >
                            <Column header="No" body={rowCount} />
                            {columns.map((col) => (
                                <Column key={col.field} field={col.field} header={col.header} />
                            ))}
                            <Column header="Report" body={reportBodyTemplate} />
                        </DataTable>
                    </>
                )}

                <Dialog visible={reportDialog} style={{ width: '700px' }} header={reportHeader} onHide={hideDialog}>
                    <div className="field">
                        <div className="formgrid grid" style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {!dialogLoading && countries?.length > 0 ? (
                                countries?.map((key, index) => (
                                    <div key={index} className="col-4 mb-3" style={{ width: `${columnWidth}%` }} onClick={() => showReport(key?.TapeName)}>
                                        <div className="card" style={{ cursor: 'pointer' }}>
                                            <div className="text-center">
                                                {key?.Country} ({key?.TapeName})
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-lg ml-8">🐰 Currently no schedule found for this file type.</span>
                            )}
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default Page;
