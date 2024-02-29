'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

import { useClientStore } from '../../../../../utilities/store/index';
import { DELETE, GET, POST, PUT } from '../../../../api/service/auth/route';
import { SplitButton } from 'primereact/splitbutton';

export default function ManageCliams() {
    const [clientStore] = useClientStore((state) => [state.id]);

    const [clientData, setClientData] = useState(null);

    useEffect(() => {
        setClientData(clientStore);
    }, []);

    let emptyRoleModel = {
        name: '',
        clientId: 0,
        description: '',
        roleClaims: null,
        claims: null,
        recordStatus: 0
    };

    const [role, setRole] = useState(emptyRoleModel);
    const [roles, setRoles] = useState([]);
    const [roleClaims, setRoleClaims] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [roleDialog, setRoleDialog] = useState(false);
    const [newRoleDialog, setNewRoleDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);
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
        defaultValues: { ...emptyRoleModel }
    });

    const toast = useRef(null);

    const fetchRolesByClient = () => {
        setLoading(true);
        GET(`/api/v1/Role/GetByClientId?clientId=${clientStore?.id}`)
            .then((res) => {
                setRoles(res.data);
            })
            .catch(() => {
                setRoles([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchClientClaims = () => {
        GET(`/api/v1/ClientClaim/GetByClientId?ClientId=${clientStore?.id}`)
            .then((res) => {
                const roles = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setRoleClaims(roles);
            })
            .catch((e) => {
                setRoleClaims([]);
            });
    };

    useEffect(() => {
        fetchRolesByClient();
        fetchClientClaims();
    }, []);

    const onRoleChange = (e) => {
        let _roleClaims = [...selectedRoles];

        if (e.checked) _roleClaims.push(e.value);
        else _roleClaims.splice(_roleClaims.indexOf(e.value), 1);
        setSelectedRoles(_roleClaims);
    };

    const checkAllSelection = () => {
        if (roleClaims.length === selectedRoles.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    };

    useEffect(() => {
        checkAllSelection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoles, newRoleDialog]);

    const onSelectAllChange = (e) => {
        if (e.checked) {
            let _roleClaims = [];
            for (let i = 0; i < roleClaims.length; i++) {
                _roleClaims.push(roleClaims[i].id);
            }

            setSelectedRoles(_roleClaims);
        } else setSelectedRoles([]);

        setSelectAll(e.checked);
    };

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

        setLoadingRoles(false);
        setNewRoleDialog(true);
        setRoleDialog(true);
    };

    const getClaimsForUpdating = (id) => {
        GET(`/api/v1/Role/GetById?id=${id}`, 'Roles-View')
            .then((res) => {
                const prevRole = res.data?.roleClaims.map((value) => {
                    return value.clientClaim.id;
                });
                setSelectedRoles(prevRole);
            })
            .finally(() => {
                setLoadingRoles(false);
            });
    };

    const showEditRoleDialog = (_role) => {
        setRole(_role);
        reset(_role);

        getClaimsForUpdating(_role.id);

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

    const addRole = (data) => {
        let requestBody = data;

        requestBody.clientId = clientData?.id;
        requestBody.claims = selectedRoles;

        setPerformingAction(true);

        let res = POST(requestBody, `/api/v1/Role/Create`, 'Roles-Add');
        if (res) {
            setRoles((prev) => [...prev, requestBody]);
        }
        setSelectedRoles([]);
        setRoleDialog(false);
        setRole(emptyRoleModel);
        setPerformingAction(false);
        hideRoleDialog();
    };

    const editRole = (data) => {
        let _role = data;

        const index = _role.id;
        _role.roleClaims = selectedRoles;
        _role.claims = selectedRoles;

        setPerformingAction(true);

        let res = PUT(_role, `/api/v1/Role/Update?id=${index}`, 'Roles-Edit');
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
        setSelectedRoles([]);
        setRoleDialog(false);
        setRole(emptyRoleModel);
        setPerformingAction(false);
        hideRoleDialog();
    };

    const deleteRole = () => {
        setPerformingAction(true);

        if (role.id) {
            let res = DELETE(`/api/v1/Role/Delete?id=${role.id}`, 'Roles-Delete');
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

        const successMessage = role.recordStatus !== 1 ? 'Role Successfully Deactivated.' : 'Role Successfully Activated.';
        const status = role.recordStatus === 1 ? 2 : 1;
        const id = role.id;

        if (status) {
            roleService
                .activateDeactivateRole({ recordStatus: status, id }, '', 'Roles-ChangeStatus')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: successMessage, life: 4000 });
                    fetchRolesByClient();
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
                    <Button icon="pi pi-plus" label="New" onClick={showNewRoleDialog} />
                </div>
            </React.Fragment>
        );
    };

    const searchInput = () => {
        return (
            <span className="flex gap-4">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Roles" />
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
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Submit" icon="pi pi-check" text disabled={loadingRoles} onClick={newRoleDialog ? handleSubmit(addRole) : handleSubmit(editRole)} />}
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
            <Button label="No" icon="pi pi-times" text onClick={() => setChangeStatusDialog(false)} />
            {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" text></Button> : <Button label="Yes" icon="pi pi-check" text onClick={changeStatus} />}
        </>
    );

    return (
        <div className="card">
            <div className="card">
                <h4>[ {clientData?.clientName} ] Roles</h4>
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
                emptyMessage="No Role found start by creating one."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} Roles"
            >
                <Column field="name" header="Name" sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="description" header="Description" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="recordStatus" header="Status" body={recordStatusBody} sortable style={{ minWidth: '5rem' }} filter filterElement={statusFilterTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                <Column body={actionBodyTemplate} header="Action" style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
            </DataTable>

            <Dialog visible={deleteRoleDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRoleDialogFooter} onHide={hideRoleDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {role && (
                        <span>
                            Are you sure you want to delete <b>{role.name}</b> Role?
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
                            Role?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={roleDialog} style={{ width: '900px', height: '80vh' }} header={newRoleDialog ? 'New Role' : 'Update Role'} modal className="p-fluid" footer={roleDialogFooter} onHide={hideRoleDialog}>
                <div className="field">
                    <label htmlFor="name">Name *</label>
                    <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s]*$/} id="name" value={field.value} onChange={field.onChange} required autoFocus {...field} />} />
                    {errors.name?.type === 'required' && <small className="p-error">Role name is required.</small>}
                </div>

                <div className="field">
                    <label htmlFor="Description">Description *</label>
                    <Controller name="description" control={control} rules={{ required: true }} render={({ field }) => <InputTextarea {...field} rows={5} cols={30} id="description" value={field.value} onChange={field.onChange} required />} />
                    {errors.description?.type === 'required' && <small className="p-error">Role description is required.</small>}
                </div>

                <div className="field col-12">
                    <label htmlFor="roleClaims">
                        Privileges *
                        <Checkbox inputId="binary" className="ml-3" checked={selectAll} onChange={onSelectAllChange} />
                        <label htmlFor="binary" className="p-checkbox-label ml-1">
                            Select All
                        </label>
                    </label>
                    <div className="p-fluid formgrid grid pt-4">
                        {loadingRoles ? (
                            <i className="field pi pi-spin pi-spinner ml-5 mt-5" style={{ fontSize: '2em' }}></i>
                        ) : (
                            roleClaims.map((value) => {
                                return (
                                    <div className="field col-4 field-checkbox" key={value.id}>
                                        <Checkbox inputId={value.id} value={value.id} onChange={onRoleChange} checked={selectedRoles.indexOf(value.id) !== -1}></Checkbox>
                                        <label htmlFor={value.id} className="p-checkbox-label">
                                            {value.name}
                                        </label>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
