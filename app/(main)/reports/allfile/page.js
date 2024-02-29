'use client';
import React, { useState } from 'react';
import { GET } from '../../../api/service/axios/route';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import moment from 'moment/moment';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

const Page = () => {
    const [files, setFiles] = useState(null);
    const [failed, setFailed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [date, setDate] = useState(moment().format('MMMM DD, YYYY'));
    useEffect(() => {
        let date = moment().format('MM/DD/YYYY');

        fetchData(date);
    }, []);
    async function fetchData(val) {
        setLoading(true);
        try {
            const data = await GET(`/api/Logfiles/Filelogbydates?Logdates=${val}`);
            setFiles(data);
            setFailed(data.filter((key) => key.Status === 2));
        } catch (err) {
            toast.error('Error ' + err?.message);
        } finally {
            setLoading(false);
        }
    }
    const onGlobalFilter = (val) => {
        let date = moment(val).format('MM/DD/YYYY');
        fetchData(date);
        setDate(moment(val).format('MMMM DD, YYYY'));
    };
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h4 className="m-0">Failed files</h4>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full" />
            </span>
        </div>
    );
    return (
        <div className="card">
            {loading && <ProgressBar mode="indeterminate" style={{ height: '1px' }}></ProgressBar>}

            <div className="flex justify-content-between align-items-center mb-5">
                <h5>{date}</h5>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <Calendar type="search" onChange={(e) => onGlobalFilter(e.value)} placeholder="Select date..." />
                </span>
            </div>
            <div className="field">
                <div className="formgrid grid">
                    {files?.map((key, index) => (
                        <div key={index} className="col-2">
                            <Button
                                label={key.FileType}
                                disabled={true}
                                className={key.Status === 3 ? 'w-full p-button-raised p-button-success mb-1' : 'w-full p-button-raised p-button-danger mb-1'}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-5">
                <DataTable value={failed} rows={5} paginator header={header} globalFilter={globalFilter}>
                    <Column field="FileType" header="File Type" />
                    <Column field="FileName" header="File Name" />
                </DataTable>
            </div>
        </div>
    );
};

export default Page;
