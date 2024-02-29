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
import { Ripple } from 'primereact/ripple';
import UserService from '../../../services/userService';
import { Dropdown } from 'primereact/dropdown';

export default function ClientClaim() {
    let emptyRoleModel = {
        claim: [],
        serviceId:'',
        requiredIdToken:false
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
    const [client,setClient]=useState();
    const [selectAll, setSelectAll] = useState(false);
    const [performingAction, setPerformingAction] = useState(false);
    const [checked, setChecked] = useState(false);
    const [selectedClient,setSelectedClient]=useState();
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
        Service.getApiClaim()
            .then((res) => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error while fetching API Claim', life: 4000 });
            })
            .finally(() => {
                setLoading(false);
            });
            Service.getAllService("").then((res)=>{
                setClient(res.data)
               
            })
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

        setLoadingRoles(false);
        setNewRoleDialog(true);
        setRoleDialog(true);
    };

    const getClaimsForUpdating = (id) => {
        Service.getSingleClientClaim(id, 'ClientClaim-View')
            .then((res) => {})
            .finally(() => {
                setLoadingRoles(false);
            });
    };

    const showEditRoleDialog = (_role) => {
        // console.log("APIClaims",_role)
       
        // console.log("role",role)
       
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
        setSelectedRoles([]);
        setPerformingAction(false);
        setRoleDialog(false);
        setLoadingRoles(true);
    };

    const hideRoleDeleteDialog = () => {
        setDeleteRoleDialog(false);
    };

    const addClientClaim = (data) => {
      debugger
        let requestBody = data;
        let {claim}=data;
        let claimArray=[];
        claimArray.push(claim);
        requestBody.claim=claimArray;
        setLoading(true);
    //    console.log("request",requestBody)
        // requestBody.clientId = 1
        // requestBody.claims = selectedRoles;
        // setPerformingAction(true);
        // console.log(requestBody);
        debugger
        Service.createApiClaim(requestBody, 'ClientClaims-Add')
            .then((res) => {
                RefreshTable();
                setLoading(false);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Successfully added a new API Claim',
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
                setPerformingAction(false);
                hideRoleDialog();
            });
    };

    const editClientClaim = (data) => {
        let _role = data;
        const index = _role.id;
        setPerformingAction(true);
      

        Service.updateApiClaim(_role, index, 'ClientClaim-Edit')
            .then((res) => {
                toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'API Claim updated successfully', life: 4000 });
                RefreshTable()
               

            })
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error updating API Claim', life: 4000 });
                setLoading(false);
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
        setLoading(true);
        setPerformingAction(true);

        if (role.id) {
            Service.deleteApiClaim(role.id, 'ClientClaim-Delete')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'API Claim Successfully Deleted', life: 4000 });
                    RefreshTable();
                    setLoading(false);

                    
                })
                .catch((err) => {
                    
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error deleting API Claim', life: 4000 });
                    setLoading(false);
                })
                .finally(() => {
                    setDeleteRoleDialog(false);
                    setRole(emptyRoleModel);
                    setPerformingAction(false);
                });
        }
    };
    const RefreshTable = (e) => {
        Service.getApiClaim()
        .then((res) => {
            setRoles(res.data);
            setLoading(false);
        })
        .catch(() => {
            toast.current.show({ severity: 'error', summary: 'Error Message', detail: 'Error while fetching API Claim', life: 4000 });
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const changeStatus = () => {
        setPerformingAction(true);
        setLoading(true);
        const successMessage = role.recordStatus !== 1 ? 'API Claim Successfully Inactivated.' : 'API Claim Successfully Activated.';
        const errorMessage = role.recordStatus !== 1 ? 'Error while inactivating API Claim.' : 'Error while activating API Claim.';
        const status = role.recordStatus === 1 ? 2 : 1;
        const id = role.id;

        if (status) {
            Service.activateDeactivateApiClaim({ recordStatus: status, id }, '', 'ClientClaim-ChangeStatus')
                .then((res) => {
                    toast.current.show({ severity: 'success', summary: 'Success Message', detail: successMessage, life: 4000 });
                    RefreshTable()
                    setLoading(false);
                })
                .catch(() => {
                    toast.current.show({ severity: 'error', summary: 'Error Message', detail: errorMessage, life: 4000 });
                    setLoading(false);
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
                    <Button icon="pi pi-plus" label="New" className="login-btn " onClick={showNewRoleDialog} style={{backgroundColor:"#20a77c"}} ><Ripple/></Button>
                </div>
            </React.Fragment>
        );
    };

    const searchInput = () => {
        return (
            <span className='flex gap-4'>
            <span className="p-input-icon-left flex">
               
              
                <Dropdown value={selectedClient} onChange={(e) => {setSelectedClient(e.value)
                 SearchClient(e.value)    
            }} options={client} optionLabel="name" placeholder="Filter By Service" 
                filter   className="w-full md:w-14rem" optionValue='id'/>
            </span>
             <span className="p-input-icon-left">
             <i className="pi pi-search" />
             <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Api Claim" />
         </span>
         </span>
        );
    };
    const SearchClient = (client) => {
        setLoading(true);
        Service
        .getAPIClaimByService(client, 'Roles-Add')
        .then((res) => {
           
            setRoles(res.data)
            setLoading(false);
        })
        .catch((err) => {
            toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            setRoles(null);
            setLoading(false);
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
                <Button label="Submit" icon="pi pi-check" className="p-button-raised"  onClick={newRoleDialog ? handleSubmit(addClientClaim) : handleSubmit(editClientClaim)} />
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
                emptyMessage="No API Claim found ."
                currentPageReportTemplate="Showing {first} - {last} of {totalRecords} API Claim"
            >
               
                <Column field="claim" header="Claim" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="service.name" header="Service Name" sortable style={{ minWidth: '12rem' }} headerStyle={{ minWidth: '12rem' }}></Column>
                <Column field="service.description" header="Description" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
                <Column field="requireIdToken" header="Token Required" sortable style={{ minWidth: '20rem' }} headerStyle={{ minWidth: '20rem' }}></Column>
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
            <Dialog visible={roleDialog} style={{ width: '40vw', height: '40vh' }} header={newRoleDialog ? 'New API Claim' : 'Update API Claim'} modal className="p-fluid" footer={roleDialogFooter} onHide={hideRoleDialog}>
                <div className="field">
                    <label htmlFor="claim">Claim *</label>
                    <Controller name="claim" control={control} rules={{ required: true }} render={({ field }) => <InputText keyfilter={/^[a-zA-Z\s\-]*$/} id="claim" value={field.value} onChange={field.onChange} required  {...field} />} />
                    {errors.name?.type === 'required' && <small className="p-error"> Claim is required.</small>}
                </div>
                
                <div className="p-fluid field">
                    <label htmlFor="serviceId">Service Id *</label>
                    <Controller
                        name="serviceId"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Dropdown
                                value={field.value}
                                onChange={
                                    field.onChange
                                }
                                options={client}
                                optionLabel="name"
                                placeholder="Select Service"
                                filter
                                
                                optionValue="id"
                                {...field}
                            />
                        )}
                    />
                    {errors.serviceId?.type === 'required' && <small className="p-error">Service is required.</small>}
                </div>
               
                <div className='flex'>
              
                <label htmlFor="IdToken"> *IdToken Required?</label>
                <Controller name="requiredIdToken" control={control} rules={{ required: false }} render={({ field }) => <Checkbox onChange={field.onChange} checked={field.value} className="ml-2" id='IdToken'  {...field}/>} />
                    {errors.requiredIdToken?.type === 'required' && <small className="p-error">requiredIdToken</small>}
                </div>
               
            </Dialog>
        </div>
    );
}
