'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';
import { useClientStore } from '../../../../utilities/store';
import { DELETE, GET, POST, PUT } from '../../../api/service/auth/route';
import { SplitButton } from 'primereact/splitbutton';

export default function Service() {
    const [setClient] = useClientStore((state) => [state.update]);

    const router = new useRouter();

    let emptyServiceModel = {
        name: '',
        description: '',
        apiClaims: ''
    };

    const [service, setService] = useState(emptyServiceModel);
    const [services, setServices] = useState([]);
    const [serviceClaims, setServiceClaims] = useState([{ claim: '', requiredIdToken: false }]);

    const [serviceDialog, setServiceDialog] = useState(false);
    const [newServiceDialog, setNewServiceDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [performingAction, setPerformingAction] = useState(false);

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        description: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
        },
        recordStatus: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    });

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        defaultValues: { ...emptyServiceModel }
    });

    const toast = useRef(null);

    useEffect(() => {
        GET('/api/v1/Service/GetAll')
            .then((res) => {
                setServices(res.data);
                setLoading(false);
            })
            .catch(() => {

            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const showNewServiceDialog = () => {
        setService(emptyServiceModel);
        reset(emptyServiceModel);

        setLoadingServices(false);
        setNewServiceDialog(true);
        setServiceDialog(true);
    };

    const getClaimsForUpdating = (id) => {
        GET(`/api/v1/Service/GetByID?id=${id}`, 'Service-View')
            .then((res) => {})
            .finally(() => {
                setLoadingServices(false);
            });
    };

    const showEditServiceDialog = (_service) => {
        setService(_service);
        reset(_service);

        getClaimsForUpdating(_service.id);

        setNewServiceDialog(false);
        setServiceDialog(true);
    };

    const showConfirmDeleteDialog = (_service) => {
        setService(_service);
        setDeleteServiceDialog(true);
    };

    const showChangeStatusDialog = (_service) => {
        setService(_service);
        setChangeStatusDialog(true);
    };

    const hideServiceDialog = () => {
        setPerformingAction(false);
        setServiceDialog(false);
        setLoadingServices(true);
    };

    const hideServiceDeleteDialog = () => {
        setDeleteServiceDialog(false);
    };

    const addService = (data) => {
        let requestBody = data;
        setPerformingAction(true);
        let apiClaims = [];
        serviceClaims.map((v, i) => {
            apiClaims.push(`${v.claim}/${v.requiredIdToken}`);
        });
        requestBody['apiClaims'] = apiClaims.join(',');

        let res = POST(requestBody, '/api/v1/Service/Create', 'Service-Add');
        if (res) {
            setServices((prev) => [...prev, data]);
        }

        setServiceDialog(false);
        setService(emptyServiceModel);
        setPerformingAction(false);
        hideServiceDialog();
    };

    const editService = (data) => {
        let _service = data;
        const index = _service.id;
        setPerformingAction(true);
        let res = PUT(_service, `/api/v1/Service/Update?id=${index}`, 'Service-Edit');
        if (res) {
            setServices((prev) =>
                prev.map((item) => {
                    if (item.id === data?.id) {
                        return data;
                    }
                    return item;
                })
            );
        }
        setServiceDialog(false);
        setService(emptyServiceModel);
        setPerformingAction(false);
        hideServiceDialog();
    };

    const deleteService = () => {
        setPerformingAction(true);

        if (service.id) {
            let res = DELETE(`/api/v1/Client/Delete?id=${service.id}`, 'Service-Delete');
            if (res) {
                setServices(services.filter((item) => item.id !== service?.id));
            }
            setDeleteServiceDialog(false);
            setService(emptyServiceModel);
            setPerformingAction(false);
        }
    };

    const changeStatus = () => {
        setPerformingAction(true);

        const successMessage = service.recordStatus !== 1 ? 'Service Successfully Deactivated.' : 'Service Successfully Activated.';
        const recordStatus = service.recordStatus === 1 ? 2 : 1;
        const id = service.id;

        if (recordStatus) {
            Service.activateDeactivateService({ status: recordStatus, serviceId: id }, '', 'Service-ChangeStatus')
                .then((res) => {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Success Message',
                        detail: successMessage,
                        life: 4000
                    });
                    setLoading(true);
                })
                .catch(() => {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error Message',
                        detail: `${err.response.data.errors[0]}`,
                        life: 4000
                    });
                })
                .finally(() => {
                    setChangeStatusDialog(false);
                    setService(emptyServiceModel);
                    setPerformingAction(false);
                });
        }
    };

    const handleServiceClaimChange = (e, index) => {
        let { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            value = checked;
        }
        if (value?.name !== undefined) {
            value = value?.name;
        }
        const list = [...serviceClaims];
        list[index][name] = value;
        setServiceClaims(list);
    };

    const handleAddClick = () => {
        setServiceClaims([...serviceClaims, { claim: '', requiredIdToken: false }]);
    };

    const handleRemoveClick = (index) => {
        const list = [...serviceClaims];
        list.splice(index, 1);
        setServiceClaims(list);
    };

    const addNewServiceBtn = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button icon="pi pi-plus" label="New" onClick={showNewServiceDialog} />
                </div>
            </React.Fragment>
        );
    };

    const searchInput = () => {
        return (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Service" />
            </span>
        );
    };

    const save = (data) => {
        setClient({
            id: data?.id,
            name: data?.name
        });
        router.push('/management/services/claims');
    };

    const item = (data) => [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                showEditServiceDialog(data);
            }
        },
        {
            label: 'API Claims',
            icon: 'pi pi-shield',
            command: () => {
                save(data);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                showConfirmDeleteDialog(data);
            }
        }
    ];
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions flex">
                <SplitButton label="Action" className="p-button-raised p-button-primary p-button-text mr-2 mb-2" model={item(rowData)} size="small" />
            </div>
        );
    };
    const statuses = [
        { name: 'Active', value: '2' },
        { name: 'Inactive', value: '1' }
    ];

    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} optionLabel={'name'} onChange={(e) => options.filterCallback(e.value, options.index)} placeholder="Select a Status" className="p-column-filter" showClear />;
    };

    const recordStatusBody = (rowData) => {
        const status = rowData.recordStatus;

        if (status === 1) {
            return (
                <span
                    style={{
                        backgroundColor: '#FFCDD2',
                        color: '#C63737',
                        padding: '0.25em 0.5rem',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '.3px'
                    }}
                >
                    Inactive
                </span>
            );
        } else {
            return (
                <span
                    style={{
                        backgroundColor: '#C8E6C9',
                        color: '#256029',
                        padding: '0.25em 0.5rem',
                        borderRadius: '2px',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '.3px'
                    }}
                >
                    Active
                </span>
            );
        }
    };

    const serviceDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideServiceDialog} />
            {performingAction ? (
                <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button>
            ) : (
                <Button label="Submit" icon="pi pi-check" text disabled={loadingServices} onClick={newServiceDialog ? handleSubmit(addService) : handleSubmit(editService)} />
            )}
        </>
    );

    const deleteServiceDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideServiceDeleteDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Yes" icon="pi pi-check" text onClick={deleteService} />}
        </>
    );

    const changeStatusServiceDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setChangeStatusDialog(false)} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Yes" icon="pi pi-check" text onClick={changeStatus} />}
        </>
    );
    const rowCount = (rowData, props) => {
        let index = parseInt(props.rowIndex + 1, 10);

        return (
            <React.Fragment>
                <span>{index}</span>
            </React.Fragment>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={addNewServiceBtn} right={searchInput} />
            <DataTable
                value={services}
                paginator
                // header={headerRender}
                rows={5}
                rowsPerPageOptions={[5, 10, 15]}
                dataKey="id"
                rowHover
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                responsiveLayout="scroll"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage="No Service found ."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} Services"
            >
                <Column header="#" headerStyle={{ width: '3rem' }} body={(data, options) => options.rowIndex + 1}></Column>
                <Column field="name" header="Name" sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="description" header="Description" sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="recordStatus" header="Status" body={recordStatusBody} sortable style={{ minWidth: '5rem' }} filter filterElement={statusFilterTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                <Column body={actionBodyTemplate} header="Action" style={{ minWidth: '30rem' }} headerStyle={{ minWidth: '30rem' }}></Column>
            </DataTable>

            <Dialog visible={serviceDialog} style={{ width: '650px' }} header={newServiceDialog ? 'New Service' : 'Update Service'} modal className="p-fluid" footer={serviceDialogFooter} onHide={hideServiceDialog}>
                <div className="field">
                    <label htmlFor="name">Name *</label>
                    <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s]*$/} id="name" value={field.value} onChange={field.onChange} required autoFocus {...field} />} />
                    {errors.name?.type === 'required' && <small className="p-error">Service name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="Description">Description *</label>
                    <Controller name="description" control={control} rules={{ required: true }} render={({ field }) => <InputTextarea {...field} rows={3} cols={20} id="description" value={field.value} onChange={field.onChange} required />} />
                    {errors.description?.type === 'required' && <small className="p-error">Service description is required.</small>}
                </div>

                {newServiceDialog ? (
                    <div className="field">
                        <label htmlFor="apiClaims">API Claims </label>
                        {serviceClaims.map((x, i) => {
                            return (
                                <div key={i} className="mb-6">
                                    <div className="card p-fluid grid mb-2">
                                        <div className="col-5">
                                            <h6>Claim</h6>
                                            <InputText name="claim" value={x.claim} onChange={(e) => handleServiceClaimChange(e, i)} placeholder="Claim" />
                                        </div>
                                        <div className="mb-2 col-1"></div>
                                        <div className="col-3">
                                            <h6>Required Id Token</h6>
                                            <Checkbox checked={x.requiredIdToken} onChange={(e) => handleServiceClaimChange(e, i)} name="requiredIdToken" id="requiredIdToken" className="ml-4" />
                                        </div>
                                        <div className="col-3 mt-5">
                                            {serviceClaims.length !== 1 && <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" onClick={() => handleRemoveClick(i)} />}
                                            {serviceClaims.length - 1 === i && <Button icon="pi pi-plus" className="p-button-rounded p-button-success mr-2" onClick={handleAddClick} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <></>
                )}
            </Dialog>

            <Dialog visible={deleteServiceDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteServiceDialogFooter} onHide={hideServiceDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {service && (
                        <span>
                            Are you sure you want to delete <b>{service.name}</b> Service?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={changeStatusDialog} style={{ width: '450px' }} header="Confirm" modal footer={changeStatusServiceDialogFooter} onHide={() => setChangeStatusDialog(false)}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {service && (
                        <span>
                            Are you sure you want to{' '}
                            <b>
                                {service.recordStatus === 1 ? 'Activate' : 'Deactivate'} {service.name}
                            </b>{' '}
                            Service?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
