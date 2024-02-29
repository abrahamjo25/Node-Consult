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
import { InputNumber } from 'primereact/inputnumber';
import { SplitButton } from 'primereact/splitbutton';
import { InputTextarea } from 'primereact/inputtextarea';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { useClientStore } from '../../../../utilities/store/index';
import { useRouter } from 'next/navigation';
import { DELETE, GET, PATCH, POST, PUT } from '../../../api/service/auth/route';

export default function Clients() {
    const router = new useRouter();

    let emptyClientModel = {
        clientName: '',
        clientId: '',
        clientSecret: '',
        description: '',
        accessTokenLifeTime: 3600,
        refreshTokenLifeTime: 3600,
        apiClaims: []
    };

    const [setClientStore] = useClientStore((state) => [state.update]);

    const [client, setClient] = useState(emptyClientModel);
    const [clients, setClients] = useState([]);
    const [clientClaims, setClientClaims] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);

    const [clientDialog, setClientDialog] = useState(false);
    const [newClientDialog, setNewClientDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteClientDialog, setDeleteClientDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [selectAll, setSelectAll] = useState(false);
    const [performingAction, setPerformingAction] = useState(false);

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        recordStatus: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    });

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        defaultValues: { ...emptyClientModel }
    });

    const toast = useRef(null);

    useEffect(() => {
        setLoading(true);
        GET(`/api/v1/Client/GetAll?recordStatus=2`, `Clients-GetAll`)
            .then((res) => {
                setClients(res.data);
                setLoading(false);
            })
            .catch(() => {
            });

        GET('/api/v1/ApiClaim/GetAll')
            .then((res) => {
                const clients = res.data.sort((a, b) => a.claim.localeCompare(b.claim));
                setClientClaims(clients);
            })
            .catch((e) => {
                setClientClaims([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const onClientChange = (e) => {
        let _clientClaims = [...selectedClients];

        if (e.checked) _clientClaims.push(e.value);
        else _clientClaims.splice(_clientClaims.indexOf(e.value), 1);

        setSelectedClients(_clientClaims);
    };

    const checkAllSelection = () => {
        if (clientClaims?.length === selectedClients?.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    };

    useEffect(() => {
        checkAllSelection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClients, newClientDialog]);

    const onSelectAllChange = (e) => {
        if (e.checked) {
            let _clientClaims = [];
            for (let i = 0; i < clientClaims.length; i++) {
                _clientClaims.push(clientClaims[i].id);
            }

            setSelectedClients(_clientClaims);
        } else setSelectedClients([]);

        setSelectAll(e.checked);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const showNewClientDialog = () => {
        setClient(emptyClientModel);
        reset(emptyClientModel);

        setLoadingClients(false);
        setNewClientDialog(true);
        setClientDialog(true);
    };

    const getClaimsForUpdating = (id) => {
        GET(`/api/v1/ClientClaim/GetById?id=${id}`, 'Client-View')
            .then((res) => {
                const prevClient = res.data?.clientApiResourses?.map((value) => {
                    return value.apiClaim.id;
                });
                setSelectedClients(prevClient);
            })
            .finally(() => {
                setLoadingClients(false);
            });
    };

    const showEditClientDialog = (_client) => {
        setClient(_client);
        reset(_client);

        getClaimsForUpdating(_client.id);

        setNewClientDialog(false);
        setClientDialog(true);
    };

    const showConfirmDeleteDialog = (_client) => {
        setClient(_client);
        setDeleteClientDialog(true);
    };

    const showChangeStatusDialog = (_client) => {
        setClient(_client);
        setChangeStatusDialog(true);
    };

    const hideClientDialog = () => {
        setSelectedClients([]);
        setPerformingAction(false);
        setClientDialog(false);
        setLoadingClients(true);
    };

    const hideClientDeleteDialog = () => {
        setDeleteClientDialog(false);
    };

    const addClient = (data) => {
        let requestBody = data;

        // requestBody.clientId = 1
        requestBody.apiClaims = selectedClients;

        setPerformingAction(true);
        const res = POST(requestBody, '/api/v1/Client/Create');
        if (res) {
            setClients((prev) => [...prev, data]);
        }
        setSelectedClients([]);
        setClientDialog(false);
        setClient(emptyClientModel);
        setPerformingAction(false);
        hideClientDialog();
    };

    const editClient = (data) => {
        let _client = data;

        const index = _client.id;

        _client.clientApiResourses = selectedClients;
        _client['apiClaim'] = _client.clientApiResourses;
        delete _client.clientApiResourses;

        setPerformingAction(true);

        let res = PATCH(_client, `/api/v1/Client/Update?id=${index}`, 'Client-Edit');
        if (res) {
            setClients((prev) =>
                prev.map((item) => {
                    if (item.id === data?.id) {
                        return data;
                    }
                    return item;
                })
            );
        }
        setSelectedClients([]);
        setClientDialog(false);
        setClient(emptyClientModel);
        setPerformingAction(false);
        hideClientDialog();
    };

    const deleteClient = () => {
        setPerformingAction(true);

        if (client.id) {
            let res = DELETE(`/api/v1/Client/Delete?id=${client.id}`, 'Client-Delete');
            if (res) {
                setClients(clients.filter((item) => item.id !== client?.id));
            }
            setDeleteClientDialog(false);
            setClient(emptyClientModel);
            setPerformingAction(false);
        }
    };

    const changeStatus = () => {
        setPerformingAction(true);

        const recordStatus = client.recordStatus === 1 ? 2 : 1;
        const id = client.clientId;

        if (recordStatus) {
            let res = PUT({ status: recordStatus, clientId: id }, '/api/v1/Client/ActivateDeactivateClient', 'Clients-ChangeStatus');
            if (res) {
                setClients((prev) =>
                    prev.map((item) => {
                        if (item.id === id) {
                            return { ...item, recordStatus: recordStatus };
                        }
                        return item;
                    })
                );
            }
            setChangeStatusDialog(false);
            setClient(emptyClientModel);
            setPerformingAction(false);
        }
    };

    const addNewClientBtn = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button icon="pi pi-plus" label="New" onClick={showNewClientDialog} />
                </div>
            </React.Fragment>
        );
    };

    const searchInput = () => {
        return (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search ..." />
            </span>
        );
    };

    const headerRender = () => {
        return (
            <div className="md:flex justify-content-between align-items-center">
                <h5 className="m-0">Manage Clients</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Client" />
                </span>
            </div>
        );
    };

    const items = (data) => [
        {
            label: 'Manage Claims',
            icon: 'pi pi-key',
            command: () => {
                setClientStore({
                    id: data?.id,
                    clientId: data?.clientId,
                    clientName: data?.clientName
                });
                router.push('/management/clients/claims');
            }
        },
        {
            label: 'Manage Roles',
            icon: 'pi pi-key',
            command: () => {
                setClientStore({
                    id: data?.id,
                    clientId: data?.clientId,
                    clientName: data?.clientName
                });
                router.push('/management/clients/roles');
            }
        },
        {
            label: 'Manage API Resources',
            icon: 'pi pi-key',
            command: () => {
                setClientStore({
                    id: data?.id,
                    clientId: data?.clientId,
                    clientName: data?.clientName
                });
                router.push('/management/clients/resources');
            }
        }
    ];

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <SplitButton label="Manage" model={items(rowData)} className="p-button-raised p-button-primary p-button-text mr-2 mb-2" size="small" />
            </div>
        );
    };
    const item = (data) => [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                showEditClientDialog(data);
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
    const ActionBody = (rowData) => {
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
            return <span style={{ backgroundColor: '#FFCDD2', color: '#C63737', padding: '0.25em 0.5rem', fontWeight: 700, fontSize: '12px', letterSpacing: '.3px' }}>Inactive</span>;
        } else {
            return <span style={{ backgroundColor: '#C8E6C9', color: '#256029', padding: '0.25em 0.5rem', borderRadius: '2px', fontWeight: 700, fontSize: '12px', letterSpacing: '.3px' }}>Active</span>;
        }
    };

    const clientDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideClientDialog} />{' '}
            {performingAction ? (
                <Button label="Saving..." disabled={true} icon="pi pi-check" text />
            ) : (
                <Button label="Submit" icon="pi pi-check" disabled={loadingClients} onClick={newClientDialog ? handleSubmit(addClient) : handleSubmit(editClient)} text />
            )}
        </>
    );
    const deleteClientDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={hideClientDeleteDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={deleteClient} />}
        </>
    );

    const changeStatusClientDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={() => setChangeStatusDialog(false)} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={changeStatus} />}
        </>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={addNewClientBtn} right={searchInput} />
            <DataTable
                value={clients}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 15]}
                dataKey="id"
                rowHover
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                responsiveLayout="scroll"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage="No Clients Found!."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} Clients"
            >
                <Column header="#" headerStyle={{ width: '3rem' }} body={(data, options) => options.rowIndex + 1}></Column>
                <Column field="clientId" header="Client ID" sortable></Column>
                <Column field="clientName" header="Client Name"></Column>
                <Column field="description" header="Description"></Column>
                <Column field="recordStatus" header="Status" body={recordStatusBody} sortable filter filterElement={statusFilterTemplate}></Column>
                <Column header="Action" body={ActionBody}></Column>
                <Column body={actionBodyTemplate} header="Roles & Claims"></Column>
            </DataTable>

            <Dialog visible={deleteClientDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteClientDialogFooter} onHide={hideClientDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {client && (
                        <span>
                            Are you sure you want to delete <b>{client.clientName}</b> Client?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={changeStatusDialog} style={{ width: '450px' }} header="Confirm" modal footer={changeStatusClientDialogFooter} onHide={() => setChangeStatusDialog(false)}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {client && (
                        <span>
                            Are you sure you want to{' '}
                            <b>
                                {client.recordStatus === 1 ? 'Activate' : 'Deactivate'} {client.clientName}
                            </b>{' '}
                            Clients?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={clientDialog} style={{ width: '600px' }} header={newClientDialog ? 'New Client' : 'Update Client'} modal className="p-fluid" footer={clientDialogFooter} onHide={hideClientDialog}>
                <div className="field">
                    <label htmlFor="name">Name *</label>
                    <Controller name="clientName" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s]*$/} id="name" value={field.value} onChange={field.onChange} required autoFocus {...field} />} />
                    {errors.clientName?.type === 'required' && <small className="p-error">Client Name is rquired</small>}
                </div>

                <div className="field">
                    <label htmlFor="clientId">Client ID *</label>
                    <Controller name="clientId" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s]*$/} id="clientId" value={field.value} onChange={field.onChange} required {...field} />} />
                    {errors.clientId?.type === 'required' && <small className="p-error">Client ID is required </small>}
                </div>

                {newClientDialog ? (
                    <div className="field">
                        <label htmlFor="clientSecret">Client Secret *</label>

                        <Controller name="clientSecret" control={control} rules={{ required: false }} render={({ field }) => <Password value={field.value} onChange={field.handleChange} toggleMask placeholder="************" {...field} />} />
                        {errors.clientSecret?.type === 'required' && <small className="p-error">Client Secret is Required.</small>}
                    </div>
                ) : (
                    <></>
                )}

                <div className="field">
                    <label htmlFor="accessTokenLifeTime">Access Token Life Time </label>
                    <Controller
                        name="accessTokenLifeTime"
                        control={control}
                        rules={{ required: true, min: 3600 }}
                        render={({ field }) => <InputNumber inputId="accessTokenLifeTime" suffix=" min" value={field.value} onValueChange={field.onChange} />}
                    />
                    {errors.accessTokenLifeTime?.type === 'min' && <small className="p-error">Access token life time should be minimum 3600 </small>}
                </div>

                <div className="field">
                    <label htmlFor="refreshTokenLifeTime">Refresh Token Life Time </label>
                    <Controller
                        name="refreshTokenLifeTime"
                        control={control}
                        rules={{ required: true, min: 3600 }}
                        render={({ field }) => <InputNumber inputId="refreshTokenLifeTime" suffix=" min" value={field.value} onValueChange={field.onChange} />}
                    />
                    {errors.refreshTokenLifeTime?.type === 'min' && <small className="p-error">Refresh token life time should be minimum 3600 </small>}
                </div>

                <div className="field">
                    <label htmlFor="Description">Description *</label>
                    <Controller name="description" control={control} rules={{ required: true }} render={({ field }) => <InputTextarea {...field} rows={5} cols={30} id="description" value={field.value} onChange={field.onChange} required />} />
                    {errors.description?.type === 'required' && <small className="p-error">Claim description is required.</small>}
                </div>
            </Dialog>
        </div>
    );
}
