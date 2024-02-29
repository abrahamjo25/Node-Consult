import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

import UserService from '../../../services/userService';
import { Dropdown } from 'primereact/dropdown';

export default function ClientClaim() {
    let emptyRoleModel = {
        name: '',
        claim: '',
        description: '',
        clientId: 0
    };

    // if (window.location.hostname.split(".")[1] === undefined || window.location.hostname.split(".")[1] === "dev") {
    //     emptyRoleModel.clientId = 3
    // }

    const [role, setRole] = useState(emptyRoleModel);
    const [roles, setRoles] = useState([]);
    const [clientId, setClientId] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [roleDialog, setRoleDialog] = useState(false);
    const [newRoleDialog, setNewRoleDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [FilteredClientId, setFilteredClientId] = useState(null);
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

    const Service = new UserService();

    useEffect(() => {
        Service.getClientClaims()
            .then((res) => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error while fetching Client Claim', life: 4000 });
            })
            .finally(() => {
                setLoading(false);
            });
        Service.getClient()
            .then((res) => {
                const roles = res.data.sort((a, b) => a.clientId.localeCompare(b.clientId));
                setClientId(roles);
            })
            .catch((e) => {
                setClientId([]);
            });
    }, [loading]);
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const showNewRoleDialog = () => {
        reset(emptyRoleModel);
        setLoadingRoles(false);
        setNewRoleDialog(true);
        setRoleDialog(true);
    };
    const findIdByName = (name) => {
        debugger;
        for (let i = 0; i < clientId.length; i++) {
            if (clientId[i].clientId === name) {
                setFilteredClientId(clientId[i]);
            }
        }
    };
    const getClaimsForUpdating = async (rowData) => {
        debugger;
        let id = rowData.id;
        setLoading(false);
        Service.getSingleClientClaim(id, 'ClientClaim-View').then((res) => {
            findIdByName(res.data.client.clientId);
            let _result = { ...role };
            _result['clientId'] = res.data.client.id;
            _result['name'] = rowData.name;
            _result['claim'] = rowData.claim;
            _result['description'] = rowData.description;
            _result['id'] = rowData.id;
            setRole(_result);
        });
        showEditRoleDialog();
    };

    const showEditRoleDialog = () => {
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
        setSelectedRoles([]);
        setPerformingAction(false);
        setRoleDialog(false);
        setLoadingRoles(true);
    };

    const hideRoleDeleteDialog = () => {
        setDeleteRoleDialog(false);
    };

    const addClientClaim = () => {
        debugger;
        // let requestBody = data;

        // requestBody.clientId = 1
        // requestBody.claims = selectedRoles;
        setPerformingAction(true);
        Service.createClientCliam(role, 'ClientClaims-Add')
            .then((res) => {
                setLoading(true);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Successfully added a new Client Claim',
                    life: 4000
                });
            })
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setSelectedRoles([]);
                setRoleDialog(false);
                setRole(emptyRoleModel);
                setFilteredClientId('');
                setPerformingAction(false);
                hideRoleDialog();
            });
    };

    const editClientClaim = (data) => {
        debugger;
        let _role = role;
        const index = _role.id;
        // _role.roleClaims = selectedRoles;
        // _role.claims = selectedRoles;

        setPerformingAction(true);

        Service.updateClientClaim(role, index, 'ClientClaim-Edit')
            .then((res) => {
                toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'Client Claim updated successfully', life: 4000 });
                setLoading(true);
            })
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setSelectedRoles([]);
                setRoleDialog(false);
                setRole(emptyRoleModel);
                setFilteredClientId();
                setPerformingAction(false);
                hideRoleDialog();
            });
    };

    const deleteRole = () => {
        debugger;
        setPerformingAction(true);

        if (role.id) {
            Service.deleteClientClaim(role.id, 'ClientClaim-Delete')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'Client Claim Successfully Deleted', life: 4000 });
                    setLoading(true);
                })
                .catch((err) => {
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error deleting Client Claim', life: 4000 });
                })
                .finally(() => {
                    setDeleteRoleDialog(false);
                    setRole(emptyRoleModel);
                    setPerformingAction(false);
                });
        }
    };

    const changeStatus = () => {
        setPerformingAction(true);

        const successMessage = role.recordStatus !== 1 ? 'Client Claim Successfully Inactivated.' : 'Client Claim Successfully Activated.';
        const errorMessage = role.recordStatus !== 1 ? 'Error while inactivating Client Claim.' : 'Error while activating Client Claim.';
        const status = role.recordStatus === 1 ? 2 : 1;
        const id = role.id;

        if (status) {
            Service.activateDeactivateClientClaim({ recordStatus: status, id }, '', 'ClientClaim-ChangeStatus');
            Service.activateDeactivateClientClaim({ recordStatus: status, id }, '', 'ClientClaim-ChangeStatus')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: successMessage, life: 4000 });
                    setLoading(true);
                })
                .catch(() => {
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: errorMessage, life: 4000 });
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
                    <Button icon="pi pi-plus" label="New" className="login-btn" onClick={showNewRoleDialog} style={{ backgroundColor: '#20a77c' }} />
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
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning pl-1 mr-2" onClick={() => getClaimsForUpdating(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger pl-1 mr-2" onClick={() => showConfirmDeleteDialog(rowData)} />

                {rowData.recordStatus !== 1 ? (
                    <Button icon="pi pi-lock" className="p-button-rounded p-button-info pl-1" onClick={() => showChangeStatusDialog(rowData)} />
                ) : (
                    <Button icon="pi pi-lock-open" className="p-button-rounded p-button-info pl-1" onClick={() => showChangeStatusDialog(rowData)} />
                )}
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
            <Button label="Cancel" icon="pi pi-times" className="p-button-raised" onClick={hideRoleDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Submit" icon="pi pi-check" className="p-button-raised" onClick={newRoleDialog ? addClientClaim : editClientClaim} />}
        </>
    );

    const deleteRoleDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={hideRoleDeleteDialog} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={deleteRole} />}
        </>
    );

    const changeStatusRoleDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={() => setChangeStatusDialog(false)} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner"></Button> : <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={changeStatus} />}
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
    const onDropdawnChange = (e, name) => {
        debugger;

        const val = (e.target && e.target.value) || '';
        const { id } = val;
        let _result = { ...role };
        _result[`${name}`] = id;
        setRole(_result);
        setFilteredClientId(e.value);
    };
    const onChangeValue = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _result = { ...role };
        _result[`${name}`] = val;
        setRole(_result);
    };
    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={addNewRoleBtn} right={searchInput} />
            <DataTable
                value={roles}
                paginator
                // header={headerRender}
                rows={8}
                rowsPerPageOptions={[5, 10, 15]}
                dataKey="id"
                rowHover
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                responsiveLayout="scroll"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                emptyMessage="No Client Claim found ."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} Client Claim"
            >
                <Column field="name" header=" Claim Name" filter sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="claim" header="Claim" sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="description" header="Description" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="recordStatus" header="Status" body={recordStatusBody} sortable style={{ minWidth: '5rem' }} filter filterElement={statusFilterTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                <Column body={actionBodyTemplate} header="Action" style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
            </DataTable>
            <Dialog visible={deleteRoleDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRoleDialogFooter} onHide={hideRoleDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {role && (
                        <span>
                            Are you sure you want to delete <b>{role.name}</b> Client Claim ?
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
                                {role.recordStatus === 1 ? 'Activate' : 'Deactivate'} {role.name}
                            </b>{' '}
                            Client Claim?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={roleDialog} style={{ width: '40vw', height: '65vh' }} header={newRoleDialog ? 'New Client Claim' : 'Update Client Claim'} modal className="p-fluid" footer={roleDialogFooter} onHide={hideRoleDialog}>
                <div className="field">
                    <label htmlFor="name"> Claim Name *</label>
                    <InputText keyfilter={/^[a-zA-Z\s\-]*$/} id="name" value={role.name} onChange={(e) => onChangeValue(e, 'name')} required autoFocus />
                    {errors.name?.type === 'required' && <small className="p-error"> name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="claim">Cliam *</label>
                    <InputText keyfilter={/^[a-zA-Z\s\-]*$/} id="claim" value={role.claim} onChange={(e) => onChangeValue(e, 'claim')} required autoFocus />
                    {errors.claim?.type === 'required' && <small className="p-error">Claim is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="clientId">client Id *</label>
                    <Dropdown value={FilteredClientId || ''} options={clientId} onChange={(e) => onDropdawnChange(e, 'clientId')} optionLabel="clientId" filter filterBy="clientId" placeholder={role.clientId || 'Select Client Id'} />
                    {errors.clientId?.type === 'required' && <small className="p-error">Client Id is required.</small>}
                </div>

                <div className="field">
                    <label htmlFor="Description">Description *</label>
                    <InputTextarea rows={5} cols={30} id="description" value={role.description} onChange={(e) => onChangeValue(e, 'description')} required />
                    {errors.description?.type === 'required' && <small className="p-error"> description is required.</small>}
                </div>
            </Dialog>
        </div>
    );
}
