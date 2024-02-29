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

import UserService from '../../../services/userService';
import { Dropdown } from 'primereact/dropdown';

export default function Role() {
    let emptyRoleModel = {
        name: '',
        clientId: 0,
        description: '',
        roleClaims: null,
        claims: null,
        recordStatus: 0
    };

    // if (window.location.hostname.split(".")[1] === undefined || window.location.hostname.split(".")[1] === "dev") {
    //     emptyRoleModel.clientId = 3
    // }

    const [role, setRole] = useState(emptyRoleModel);
    const [roles, setRoles] = useState([]);
    const [roleClaims, setRoleClaims] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [roleDialog, setRoleDialog] = useState(false);
    const [newRoleDialog, setNewRoleDialog] = useState(false);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [selectAll, setSelectAll] = useState(false);
    const [performingAction, setPerformingAction] = useState(false);
    const [client, setClient] = useState();
    const [selectedclient, setSelectedClient] = useState();

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

    const roleService = new UserService();

    useEffect(() => {
        roleService
            .getroles('Dashboard-View')
            .then((res) => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error while fetching roles', life: 4000 });
            })
            .finally(() => {
                setLoading(false);
            });
        roleService
            .getRoleClaims('Dashboard-View')
            .then((res) => {
                const roles = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setRoleClaims(roles);
            })
            .catch((e) => {
                setRoleClaims([]);
            });
        roleService.getClient('').then((res) => {
            setClient(res.data);
        });
    }, [loading]);

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
        roleService
            .getSingleRole(id, 'Roles-View')
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
        debugger;
        let requestBody = data;

        // requestBody.clientId = 1
        requestBody.claims = selectedRoles;

        setPerformingAction(true);

        roleService
            .createRole(requestBody, 'Roles-Add')
            .then((res) => {
                debugger;
                setLoading(true);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Successfully added a new role',
                    life: 4000
                });
            })
            .catch((err) => {
                console.log(err);
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setSelectedRoles([]);
                setRoleDialog(false);
                setRole(emptyRoleModel);
                setPerformingAction(false);
                hideRoleDialog();
            });
    };

    const editRole = (data) => {
        let _role = data;

        const index = _role.id;
        _role.roleClaims = selectedRoles;
        _role.claims = selectedRoles;

        setPerformingAction(true);

        roleService
            .updateRole(_role, index, 'Roles-Edit')
            .then((res) => {
                toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'Role updated successfully', life: 4000 });
                setLoading(true);
            })
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error updating role', life: 4000 });
            })
            .finally(() => {
                setSelectedRoles([]);
                setRoleDialog(false);
                setRole(emptyRoleModel);
                setPerformingAction(false);
                hideRoleDialog();
            });
    };

    const deleteRole = () => {
        setPerformingAction(true);

        if (role.id) {
            roleService
                .deleteRole(role.id, 'Roles-Delete')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'Role Successfully Deleted', life: 4000 });
                    setLoading(true);
                })
                .catch((err) => {
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error deleting role', life: 4000 });
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

        const successMessage = role.recordStatus !== 1 ? 'Role Successfully Inactivated.' : 'Role Successfully Activated.';
        const errorMessage = role.recordStatus !== 1 ? 'Error while inactivating role.' : 'Error while activating role.';
        const status = role.recordStatus === 1 ? 2 : 1;
        const id = role.id;

        if (status) {
            roleService
                .activateDeactivateRole({ recordStatus: status, id }, '', 'Roles-ChangeStatus')
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
            <span className="flex gap-4">
                <span className=" flex">
                    <Dropdown
                        value={selectedclient}
                        onChange={(e) => {
                            setSelectedClient(e.value);
                            SearchClient(e.value);
                        }}
                        options={client}
                        optionLabel="clientName"
                        placeholder="Filter By Client"
                        filter
                        className="w-full md:w-14rem"
                        optionValue="id"
                    />
                </span>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Roles" />
                </span>
            </span>
        );
    };

    const SearchClient = (client) => {
        setLoading(true);
        roleService
            .getRoleByClient(client, 'Roles-Add')
            .then((res) => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setSelectedRoles([]);
                setRoleDialog(false);
                setRole(emptyRoleModel);
                setPerformingAction(false);
                hideRoleDialog();
                setLoading(false);
            });
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning pl-1 mr-2" onClick={() => showEditRoleDialog(rowData)} />
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
            {performingAction ? (
                <Button label="Submit" icon="pi pi-spin pi-spinner"></Button>
            ) : (
                <Button label="Submit" icon="pi pi-check" className="p-button-raised" disabled={loadingRoles} onClick={newRoleDialog ? handleSubmit(addRole) : handleSubmit(editRole)} />
            )}
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

            <Dialog visible={roleDialog} style={{ width: '70vw', height: '80vh' }} header={newRoleDialog ? 'New Role' : 'Update Role'} modal className="p-fluid" footer={roleDialogFooter} onHide={hideRoleDialog}>
                <div className="field">
                    <label htmlFor="name">Name *</label>
                    <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s]*$/} id="name" value={field.value} onChange={field.onChange} required autoFocus {...field} />} />
                    {errors.name?.type === 'required' && <small className="p-error">Role name is required.</small>}
                </div>
                <div className="p-fluid field">
                    <label htmlFor="client">Client *</label>
                    <Controller
                        name="clientId"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} options={client} optionLabel="clientName" placeholder="Select Client" filter optionValue="id" {...field} />}
                    />
                    {errors.description?.type === 'required' && <small className="p-error">Client is required.</small>}
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
