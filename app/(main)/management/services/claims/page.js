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
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Ripple } from 'primereact/ripple';
import { Dropdown } from 'primereact/dropdown';

import { useClientStore } from '../../../../../utilities/store/index';
import { DELETE, GET, PATCH, POST, PUT } from '../../../../api/service/auth/route';
import { SplitButton } from 'primereact/splitbutton';

export default function APIClaims() {
    const [clientStore] = useClientStore((state) => [state.id]);

    const [clientData, setClientData] = useState(null);

    useEffect(() => {
        setClientData(clientStore);
    }, []);

    let emptyRoleModel = {
        claim: [],
        serviceId: '',
        requiredIdToken: false
    };

    const [role, setRole] = useState(emptyRoleModel);
    const [roles, setRoles] = useState([]);

    const [roleDialog, setRoleDialog] = useState(false);
    const [newRoleDialog, setNewRoleDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);

    const [loading, setLoading] = useState(true);
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
        defaultValues: { ...emptyRoleModel }
    });

    const toast = useRef(null);

    const fetchAPIClaims = () => {
        setLoading(true);
        GET(`/api/v1/ApiClaim/GetAllByServiceId?recordStatus=2&ServiceId=${clientStore?.id}`)
            .then((res) => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch(() => {
                setRoles([]);
                // toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error while fetching API Claim', life: 4000 });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAPIClaims();
    }, []);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const showNewRoleDialog = () => {
        setRole(emptyRoleModel);
        reset(emptyRoleModel);

        setNewRoleDialog(true);
        setRoleDialog(true);
    };

    const showEditRoleDialog = (_role) => {
        setRole(_role);
        reset(_role);

        setNewRoleDialog(false);
        setRoleDialog(true);
    };

    const showConfirmDeleteDialog = (_role) => {
        setRole(_role);
        setDeleteRoleDialog(true);
    };

    const showChangeStatusDialog = (_role) => {
        setRole(_role);
        setChangeStatusDialog(true);
    };

    const hideRoleDialog = () => {
        setPerformingAction(false);
        setRoleDialog(false);
    };

    const hideRoleDeleteDialog = () => {
        setDeleteRoleDialog(false);
    };

    const addClientClaim = (data) => {
        setPerformingAction(true);

        let requestBody = data;
        let { claim } = data;
        let claimArray = [];
        claimArray.push(claim);
        requestBody.claim = claimArray;
        requestBody['serviceId'] = clientStore?.id;

        let res = POST(requestBody, `/api/v1/ApiClaim/Create`, 'ClientClaims-Add');
        if (res) {
            setRoles((prev) => [...prev, requestBody]);
        }
        setRoleDialog(false);
        setRole(emptyRoleModel);
        setPerformingAction(false);
        hideRoleDialog();
    };

    const editClientClaim = (data) => {
        let _role = data;
        const index = _role.id;
        setPerformingAction(true);

        let res = PATCH(_role, `/api/v1/ApiClaim/Update?id=${index}`, 'ClientClaim-Edit');
        if (res) {
            setRoles((prev) =>
                prev.map((item) => {
                    if (item?.id === _role?.id) {
                        return _role;
                    }
                    return item;
                })
            );
        }
        setRoleDialog(false);
        setRole(emptyRoleModel);
        setPerformingAction(false);
        hideRoleDialog();
    };

    const deleteRole = () => {
        setPerformingAction(true);

        if (role.id) {
            let res = DELETE(`/api/v1/ApiClaim/Delete?id=${role.id}`, 'ClientClaim-Delete');
            if (res) {
                setRoles((prev) => prev?.filter((item) => item?.id !== role?.id));
            }
            setDeleteRoleDialog(false);
            setRole(emptyRoleModel);
            setPerformingAction(false);
        }
    };

    const changeStatus = () => {
        setPerformingAction(true);
        const successMessage = role.recordStatus !== 1 ? 'API Claim Successfully Deactivated.' : 'API Claim Successfully Activated.';
        const status = role.recordStatus === 1 ? 2 : 1;
        const id = role.id;

        if (status) {
            service
                .activateDeactivateApiClaim({ recordStatus: status, id }, '', 'ClientClaim-ChangeStatus')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: successMessage, life: 4000 });
                    fetchAPIClaims();
                })
                .catch(() => {
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
                })
                .finally(() => {
                    setChangeStatusDialog(false);
                    setRole(emptyRoleModel);
                    setPerformingAction(false);
                });
        }
    };

    const addNewRoleBtn = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button icon="pi pi-plus" label="New" onClick={showNewRoleDialog}>
                        <Ripple />
                    </Button>
                </div>
            </React.Fragment>
        );
    };

    const searchInput = () => {
        return (
            <span className="flex gap-4">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Api Claim" />
                </span>
            </span>
        );
    };

    const item = (data) => [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                showEditRoleDialog(data);
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
            return <span style={{ backgroundColor: '#FFCDD2', color: '#C63737', padding: '0.25em 0.5rem', fontWeight: 700, fontSize: '12px', letterSpacing: '.3px' }}>Inactive</span>;
        } else {
            return <span style={{ backgroundColor: '#C8E6C9', color: '#256029', padding: '0.25em 0.5rem', borderRadius: '2px', fontWeight: 700, fontSize: '12px', letterSpacing: '.3px' }}>Active</span>;
        }
    };

    const roleDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRoleDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Submit" icon="pi pi-check" text onClick={newRoleDialog ? handleSubmit(addClientClaim) : handleSubmit(editClientClaim)} />}
        </>
    );

    const deleteRoleDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideRoleDeleteDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Yes" icon="pi pi-check" text onClick={deleteRole} />}
        </>
    );

    const changeStatusRoleDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={() => setChangeStatusDialog(false)} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={changeStatus} />}
        </>
    );

    return (
        <div className="card">
            <div className="card">
                <h4>[ {clientData?.name} ] API Claims</h4>
            </div>
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={addNewRoleBtn} right={searchInput} />
            <DataTable
                value={roles}
                paginator
                rows={8}
                rowsPerPageOptions={[5, 10, 15]}
                dataKey="id"
                rowHover
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                responsiveLayout="scroll"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage="No API Claim found ."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} API Claim"
            >
                <Column field="claim" header="Claim" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="requiredIdToken" header="Token Required" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="recordStatus" header="Status" body={recordStatusBody} sortable style={{ minWidth: '5rem' }} filter filterElement={statusFilterTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                <Column body={actionBodyTemplate} header="Action" style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
            </DataTable>

            <Dialog visible={deleteRoleDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRoleDialogFooter} onHide={hideRoleDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {role && (
                        <span>
                            Are you sure you want to delete <b>{role.claim}</b> API Claim ?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={changeStatusDialog} style={{ width: '450px' }} header="Confirm" modal footer={changeStatusRoleDialogFooter} onHide={() => setChangeStatusDialog(false)}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {role && (
                        <span>
                            Are you sure you want to{' '}
                            <b>
                                {role.recordStatus === 1 ? 'Activate' : 'Deactivate'} {role.claim}
                            </b>{' '}
                            API Claim?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={roleDialog} style={{ width: '30vw', height: '30vh' }} header={newRoleDialog ? 'New API Claim' : 'Update API Claim'} modal className="p-fluid" footer={roleDialogFooter} onHide={hideRoleDialog}>
                <div className="field">
                    <label htmlFor="claim">Claim</label>
                    <Controller name="claim" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s\-]*$/} id="claim" value={field.value} onChange={field.onChange} required {...field} />} />
                    {errors.name?.type === 'required' && <small className="p-error"> Claim is required.</small>}
                </div>

                <div className="flex">
                    <label htmlFor="IdToken">IdToken Required?</label>
                    <Controller name="requiredIdToken" control={control} rules={{ required: false }} render={({ field }) => <Checkbox onChange={field.onChange} checked={field.value} className="ml-2" id="IdToken" {...field} />} />
                    {errors.requiredIdToken?.type === 'required' && <small className="p-error">requiredIdToken</small>}
                </div>
            </Dialog>
        </div>
    );
}
