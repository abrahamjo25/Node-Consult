'use client';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useState, useRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Checkbox } from 'primereact/checkbox';
import _, { pick } from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import SnipperModal from '../../helper/SnipperModal';
import * as Yup from 'yup';
// import UserService from '../../../services/userService';
import { Accordion, AccordionTab } from 'primereact/accordion';
import 'react-phone-number-input/style.css';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { SplitButton } from 'primereact/splitbutton';
import { DELETE, GET, POST, PUT } from '../../../api/service/auth/route';
const Users = () => {
    const initialValues = {
        id: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmpassword: '',
        roles: [],
        isSuperAdmin: false,
        companycode: 'PVT'
    };
    const initial = {
        id: '',
        firstName: 'AAA',
        lastName: 'BBB',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmpassword: '',
        roles: [],
        companycode: ''
    };
    const [user, setUser] = useState(initialValues);
    const [company, setCompany] = useState(initial);
    const [loading1, setLoading1] = useState(true);
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    const [visibleOne, setVisibleOne] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const [userData, setUserData] = useState();
    const [companydata, setCompanyData] = useState(null);
    const [roleData, setRoleData] = useState();
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedClient, setSelectedClient] = useState();
    const [manageRD, setManageRD] = useState();
    const [selectedRoles, setSelectedRoles] = useState();
    const [loadingUserRole, setLoadingUserRole] = useState(false);
    const validateSchema = Yup.object().shape({
        visible: Yup.string(),
        firstName: Yup.string().required('*First Name field is required'),
        lastName: Yup.string().required('*Last Name is required'),
        email: Yup.string().email('*Please enter a valid email').required('*Email field is required'),
        phoneNumber: Yup.string().required('*Phone Number field is required'),
        username: Yup.string().required('*User Name  field is required'),

        password: Yup.string().when('visible', {
            is: true,
            then: Yup.string()
                .required('*Password field is required')
                .min(8, '*Pasword must be 8 or more characters')
                .matches(/(?=.*[a-z])(?=.*[A-Z])\w+/, '*Password should contain at least one uppercase and lowercase character')
                .matches(/\d/, '*Password should contain at least one number')
                .matches(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/, '*Password should contain at least one special character')
        }),

        confirmpassword: Yup.string().when('visible', {
            is: true,
            then: Yup.string().when('password', (password, field) => {
                if (password) {
                    return field.required('*The passwords do not match').oneOf([Yup.ref('password')], '*The passwords do not match');
                }
            })
        })
    });
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        description: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
        },
        recordStatus: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    });

    const toast = useRef(null);

    const item = [
        {
            label: 'For Private',
            icon: 'pi pi-user',
            command: () => {
                showNewUserDialog();
            }
        },
        {
            label: 'For Company',
            icon: 'pi pi-users',
            command: () => {
                showCompanyUserDialog();
            }
        }
    ];

    const AddNewBtn = () => {
        return (
            <div className="flex justify-content-between">
                <Button label=" New" icon="pi pi-plus" onClick={showNewUserDialog}></Button>
            </div>
        );
    };
    useEffect(() => {
        GET(`/api/v1/User/GetAll`, 'Dashboard-View')
            .then((res) => {
                setUserData(res.data);
                setLoading1(false);
            })
            .catch(() => {})
            .finally(() => {
                setLoading1(false);
            });
    }, []);

    const getIndex = (arr, value) => {
        let returnValue = -1;
        arr?.map((v, i) => {
            if (value == v?.client) {
                returnValue = i;
            }
        });
        return returnValue;
    };

    useEffect(() => {
        let roleD = [];
        let clientss = [];
        let _role = { name: '', id: 0 };

        GET('/api/v1/Role/GetAll?recordStatus=2', 'Roles-View')
            .then((res) => {
                // setSelectedClient(res.data);
                res.data?.map((role) => {
                    let clientName = role?.client?.clientName;
                    // let clientId = role?.clientId
                    let index = getIndex(clientss, clientName);
                    if (index === -1) {
                        clientss[clientss.length] = { client: clientName, roles: [] };
                        index = getIndex(clientss, clientName);
                    }
                    _role.id = role?.id;
                    _role.name = role?.name;
                    clientss[index]?.roles?.push(_role);
                    _role = {};
                });

                setSelectedClient(clientss);
            })
            .catch(() => {});

        GET(`/api/v1/Client/GetAll?recordStatus=2`, 'Clients-View')
            .then((res) => {
                res.data?.map((value) => {
                    roleD.push(pick(value, ['id', 'name']));
                });
                setRoleData(roleD);
                setLoading1(false);
            })
            .catch(() => {});
    }, []);

    const getSingleUser = (user) => {
        let roless = [];
        userService
            .getSingleUser(user.id, 'Users-View')
            .then((res) => {
                res.data.roles?.map((value) => {
                    if (value.role.recordStatus === 2) {
                        roless.push(value.role);
                    }
                });
            })
            .finally(() => {});
    };

    const showEditUserDialog = (_user) => {
        setUser(_user);
        getRolesForUpdating(_user.id);

        setVisibleOne(true);
    };
    const showConfirmDeleteDialog = (_user) => {
        setUser(_user);
        setDeleteUserDialog(true);
    };
    const showNewUserDialog = () => {
        setUser(initialValues);
        setVisible(true);
    };
    const showCompanyUserDialog = () => {
        setCompany(initial);
        setIsCompany(true);
    };
    const addUser = (data) => {
        setLoading1(true);
        let _user = data;

        _user.firstName = _user.firstName.charAt(0).toUpperCase() + _user.firstName.slice(1);
        _user.lastName = _user.lastName.charAt(0).toUpperCase() + _user.lastName.slice(1);

        const newRoles = [];
        _user.roles.map((value) => {
            newRoles.push(value.id);
        });
        let res = POST(_user, '/api/v1/User/Create', 'Dashboard-View');
        if (res) {
            setUserData((prev) => [...prev, data]);
        }
        setLoading1(false);

        setVisible(false);
    };
    const addCompanyUser = (data) => {
        debugger;
        setLoading1(true);
        let _user = data;
        _user['companycode'] = _user.companycode.companyCode;
        const newRoles = [];
        _user.roles.map((value) => {
            newRoles.push(value.id);
        });

        userService
            .createCompanyUser(_user, '')
            .then((res) => {
                toast.current.show({
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'User Successfully Added',
                    life: 4000
                });
                RefreshTable();
                setLoading1(false);
            })
            .catch((err) => {
                console.log(err);
                toast.current.show({
                    severity: 'error',
                    summary: 'Error Message',
                    detail: `${err.response.data.errors[0]}`,
                    life: 4000
                });
                setLoading1(false);
            })
            .finally(() => {
                setLoading1(false);
            });

        setIsCompany(false);
    };
    const changeStatus = () => {
        setLoading1(true);
        const status = user.isAccountLocked === true ? 1 : 2;
        const id = user.id;

        if (status) {
            let res = PUT({ statusAction: status, userId: id }, `/api/v1/User/ActivateDeactivateUser`, 'Users-ChangeStatus');
            if (res) {
                setUserData((prev) =>
                    prev.map((item) => {
                        if (item.id === id) {
                            return { ...item, isAccountLocked: !item.isAccountLocked };
                        }
                        return item;
                    })
                );
            }
            setChangeStatusDialog(false);
            setUser(initialValues);
            setLoading1(false);
        }
    };
    const hideUserDeleteDialog = () => {
        setDeleteUserDialog(false);
    };
    const RefreshTable = () => {
        userService.getUsers().then((res) => {
            setUserData(res.data);
            setLoading1(false);
        });
    };
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const showChangeStatusDialog = (_user) => {
        setUser(_user);
        setChangeStatusDialog(true);
    };

    const getRolesForUpdating = (id) => {
        setLoadingUserRole(true);
        GET(`/api/v1/User/GetById?id=${id}`, '')
            .then((res) => {
                const prevRole = res.data?.roles.map((value) => {
                    return value?.role?.id;
                });
                setSelectedRoles(prevRole);
                setLoadingUserRole(false);
            })
            .finally(() => {
                setLoadingUserRole(false);
            });
    };

    const showRoleUpdateDialog = (_user) => {
        setUser(_user);

        getRolesForUpdating(_user.id);
        setManageRD(true);
    };
    const items = (data) => [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                showEditUserDialog(data);
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                showConfirmDeleteDialog(data);
            }
        },
        {
            label: data?.isAccountLocked ? 'Activate' : 'Inactivate',
            icon: data?.isAccountLocked ? 'pi pi-lock' : 'pi pi-unlock',
            command: () => {
                showChangeStatusDialog(data);
            }
        },
        {
            label: 'Role',
            icon: 'pi pi-sliders-h',
            command: () => {
                showRoleUpdateDialog(data);
            }
        }
    ];
    const ActionBody = (rowData) => {
        return (
            <div className="actions flex">
                <SplitButton label="Action" className="p-button-raised p-button-primary p-button-text mr-2 mb-2" model={items(rowData)} size="small" />
            </div>
        );
    };
    const changeStatusRoleDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setChangeStatusDialog(false)} />
            <Button label="Yes" icon="pi pi-check" text onClick={changeStatus} />
        </>
    );

    const editUserProfile = (data) => {
        let _user = data;
        _user.roles = selectedRoles;
        _user.firstName = _user.firstName.charAt(0).toUpperCase() + _user.firstName.slice(1);
        _user.lastName = _user.lastName.charAt(0).toUpperCase() + _user.lastName.slice(1);
        updateService(_user);
        setVisibleOne(false);
        setManageRD(false);
        setUser(initialValues);
    };
    const editUserRole = () => {
        user.roles = selectedRoles;
        user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
        user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);
        updateService(user);
        setVisibleOne(false);
        setManageRD(false);
        setUser(initialValues);
        // setPerformingAction(true);
    };
    const updateService = (data) => {
        let res = PUT(data, `/api/v1/User/Update`, 'Users-Edit');
        if (res) {
            setUserData((prev) =>
                prev.map((item) => {
                    if (item.id === data?.id) {
                        return data;
                    }
                    return item;
                })
            );
        }
    };
    const searchInput = () => {
        return (
            <span className="flex gap-4">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search user" />
                </span>
            </span>
        );
    };

    const deleteUser = () => {
        if (user.id) {
            let res = DELETE(`/api/v1/User/Delete?id=${user.id}`, 'Users-Delete');
            if (res) {
                setUserData((prev) => prev.filter((item) => item.id !== user?.id));
            }
        }

        setDeleteUserDialog(false);
        setUser(initialValues);
    };
    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-raised" onClick={hideUserDeleteDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={deleteUser} />
        </>
    );
    const onRoleChange = (e) => {
        let _roleClaims = [...selectedRoles];

        if (e.checked) _roleClaims.push(e.value);
        else _roleClaims.splice(_roleClaims.indexOf(e.value), 1);

        setSelectedRoles(_roleClaims);
    };

    const recordStatusBody = (rowData) => {
        const status = rowData.isAccountLocked;

        if (!status) {
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
        } else {
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
        }
    };
    const userRoleDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-raised"
                onClick={() => {
                    setManageRD(false);
                    setSelectedRoles();
                }}
            />
            <Button label="Yes" icon="pi pi-check" className="p-button-raised" onClick={editUserRole} />
        </>
    );

    return (
        <div className="grid">
            {loadingUserRole ? <SnipperModal /> : <> {null}</>}

            <div className="col-12">
                <Toast ref={toast} />
                <div className="card">
                    <h5>Users</h5>
                    <Toolbar className="mb-4" left={AddNewBtn} right={searchInput} />
                    <DataTable value={userData} paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={8} dataKey="id" filters={filters} filterDisplay="menu" loading={loading1} responsiveLayout="scroll" emptyMessage="No Users found.">
                        <Column field="firstName" header="First Name" dataType="date" style={{ minWidth: '10rem' }} />
                        <Column field="lastName" header="Last Name" filterField="balance" dataType="numeric" style={{ minWidth: '10rem' }} />
                        <Column field="email" header="Email" filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} />
                        <Column field="username" header="UserName" showFilterMatchModes={false} style={{ minWidth: '12rem' }} />
                        <Column field="phoneNumber" header="Phone Number" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} />
                        <Column field="isAccountLocked" header="Status" body={recordStatusBody} style={{ minWidth: '12rem' }} />
                        <Column header="Actions" style={{ minWidth: '12rem' }} body={ActionBody} />
                    </DataTable>
                </div>
            </div>

            <Dialog header="New User" visible={visible} style={{ width: '700px' }} modal className="p-fluid" onHide={() => setVisible(false)}>
                <Formik
                    initialValues={user}
                    validationSchema={validateSchema}
                    onSubmit={(values) => {
                        // same shape as initial values
                        if (values.isSecondButton) {
                            addUser(values);
                        }
                    }}
                    //    validateOnBlur={false}
                    validateOnChange={false}
                >
                    {({ handleChange, isSubmitting, handleBlur, handleSubmit, values, errors, isValid, touched, setFieldValue }) => (
                        <Form>
                            <div className="p-fluid  grid card mt-2 ">
                                <span className=" field col-6 flex flex-column gap-2 ">
                                    <label htmlFor="firstName">First Name </label>
                                    <InputText id="firstName" name="firstName" value={values.firstName} onChange={handleChange} placeholder="First Name" className={errors.firstName ? 'error-input' : ''} />

                                    {errors.firstName ? <p className="error-label">{errors.firstName}</p> : null}
                                </span>
                                <span className="field col-6  flex flex-column gap-2">
                                    <label htmlFor="lastName">Last Name </label>
                                    <InputText id="lastName" name="lastName" value={values.lastName} onChange={handleChange} placeholder="Last Name" className={errors.lastName ? 'error-input' : ''} />
                                    {errors.lastName ? <p className="error-label">{errors.lastName}</p> : null}
                                </span>
                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="username">UserName </label>
                                    <InputText id="username" name="username" value={values.username} onChange={handleChange} placeholder="username" className={errors.username ? 'error-input' : ''} />
                                    {errors.username ? <p className="error-label">{errors.username}</p> : null}
                                </span>
                                <span className=" flex flex-column gap-2  col-6">
                                    <label htmlFor="email">Email </label>
                                    <InputText id="email" value={values.email} name="email" onChange={handleChange} placeholder="JohnDoe@example.com" className={errors.email ? 'error-input' : ''} />
                                    {errors.email ? <p className="error-label">{errors.email}</p> : null}
                                </span>
                                <span className=" mt-5 col-12 ">
                                    <PhoneInput
                                        placeholder="Enter phone number"
                                        value={values.phoneNumber}
                                        name="phoneNumber"
                                        onChange={(e) => setFieldValue('phoneNumber', e)}
                                        limitMaxLength={true}
                                        defaultCountry="ET"
                                        international
                                        countryCallingCodeEditable={false}
                                        className={errors.phoneNumber ? 'error-input input-phone-number' : 'input-phone-number'}
                                    />
                                    {errors.phoneNumber ? <p className="error-label">{errors.phoneNumber}</p> : null}
                                </span>

                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="password">Password </label>
                                    <Password id="password" value={values.password} name="password" onChange={handleChange} toggleMask placeholder="************" className={errors.password ? 'error-input' : ''} />
                                    {errors.password ? <p className="error-label">{errors.password}</p> : null}
                                </span>
                                <span className=" flex flex-column gap-2 col-6">
                                    <label htmlFor="confirmPassword">Confirm Password </label>
                                    <Password id="confirmPassword" value={values.confirmpassword} name="confirmpassword" onChange={handleChange} toggleMask placeholder="************" className={errors.confirmpassword ? 'error-input' : ''} />
                                    {errors.confirmpassword ? <p className="error-label">{errors.confirmpassword}</p> : null}
                                </span>

                                <span className="col-12 mt-3">
                                    <label htmlFor="roles" className="ml-2">
                                        Role
                                    </label>
                                    <MultiSelect
                                        value={values.roles}
                                        name="roles"
                                        options={selectedClient}
                                        onChange={handleChange}
                                        optionLabel="name"
                                        filter
                                        optionGroupLabel="client"
                                        id="roles"
                                        optionGroupChildren="roles"
                                        placeholder="Select role"
                                        display="chip"
                                        optionValue="id"
                                    />
                                </span>
                                <span className="col-6 mt-3">
                                    <Button label="Cancel" text onClick={() => setVisible(false)} />
                                </span>
                                <span className="col-6 mt-3 ">
                                    <Button
                                        label="Save"
                                        type="submit"
                                        text
                                        onClick={(e) => {
                                            setFieldValue('isSecondButton', true);
                                        }}
                                    />
                                </span>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Dialog>
            <Dialog header="Company User" visible={isCompany} style={{ width: '700px' }} modal className="p-fluid" onHide={() => setIsCompany(false)}>
                <Formik
                    initialValues={company}
                    validationSchema={validateSchema}
                    onSubmit={(values) => {
                        // same shape as initial values
                        if (values.isSecondButton) {
                            addCompanyUser(values);
                        }
                    }}
                    //    validateOnBlur={false}
                    validateOnChange={false}
                >
                    {({ handleChange, isSubmitting, handleBlur, handleSubmit, values, errors, isValid, touched, setFieldValue }) => (
                        <Form>
                            <div className="p-fluid  grid card mt-2 ">
                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="username">UserName </label>
                                    <InputText id="username" name="username" value={values.username} onChange={handleChange} placeholder="username" className={errors.username ? 'error-input' : ''} />
                                    {errors.username ? <p className="error-label">{errors.username}</p> : null}
                                </span>
                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="companycode">Company Code </label>
                                    <Dropdown id="companycode" name="companycode" value={values.companycode} onChange={handleChange} options={companydata} optionLabel="companyName" placeholder="Select Company Code"></Dropdown>
                                </span>
                                <span className=" flex flex-column gap-2  col-6">
                                    <label htmlFor="email">Email </label>
                                    <InputText id="email" value={values.email} name="email" onChange={handleChange} placeholder="JohnDoe@example.com" className={errors.email ? 'error-input' : ''} />
                                    {errors.email ? <p className="error-label">{errors.email}</p> : null}
                                </span>
                                <span className=" mt-5 col-6 ">
                                    <PhoneInput
                                        placeholder="Enter phone number"
                                        value={values.phoneNumber}
                                        name="phoneNumber"
                                        onChange={(e) => setFieldValue('phoneNumber', e)}
                                        limitMaxLength={true}
                                        defaultCountry="ET"
                                        international
                                        countryCallingCodeEditable={false}
                                        className={errors.phoneNumber ? 'error-input input-phone-number' : 'input-phone-number'}
                                    />
                                    {errors.phoneNumber ? <p className="error-label">{errors.phoneNumber}</p> : null}
                                </span>

                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="password">Password </label>
                                    <Password id="password" value={values.password} name="password" onChange={handleChange} toggleMask placeholder="************" className={errors.password ? 'error-input' : ''} />
                                    {errors.password ? <p className="error-label">{errors.password}</p> : null}
                                </span>
                                <span className=" flex flex-column gap-2 col-6">
                                    <label htmlFor="confirmPassword">Confirm Password </label>
                                    <Password id="confirmPassword" value={values.confirmpassword} name="confirmpassword" onChange={handleChange} toggleMask placeholder="************" className={errors.confirmpassword ? 'error-input' : ''} />
                                    {errors.confirmpassword ? <p className="error-label">{errors.confirmpassword}</p> : null}
                                </span>

                                <span className="col-12 mt-3">
                                    <label htmlFor="roles" className="ml-2">
                                        Role
                                    </label>
                                    <MultiSelect
                                        value={values.roles}
                                        name="roles"
                                        options={selectedClient}
                                        onChange={handleChange}
                                        optionLabel="name"
                                        filter
                                        optionGroupLabel="client"
                                        id="roles"
                                        optionGroupChildren="roles"
                                        placeholder="Select role"
                                        display="chip"
                                        optionValue="id"
                                    />
                                </span>
                                <span className="col-6 mt-3">
                                    <Button label="Cancel" onClick={() => setIsCompany(false)} className="p-button-warning" raised />
                                </span>
                                <span className="col-6 mt-3 ">
                                    <Button
                                        label="Submit"
                                        type="submit"
                                        autoFocus
                                        className="p-button-info"
                                        onClick={(e) => {
                                            setFieldValue('isSecondButton', true);
                                        }}
                                        raised
                                    />
                                </span>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Dialog>
            <Dialog header="Edit User" visible={visibleOne} style={{ width: '600px' }} modal className="p-fluid" onHide={() => setVisibleOne(false)}>
                <Formik
                    initialValues={user}
                    validationSchema={validateSchema}
                    //    onSubmit={(values, { validate }) => {
                    //     validate(values);

                    // }}
                    onSubmit={(values) => {
                        if (values.isSecondButton) {
                            editUserProfile(values);
                        }
                    }}
                    //    validateOnBlur={false}
                    validateOnChange={false}
                >
                    {({ handleChange, isSubmitting, handleBlur, handleSubmit, values, errors, isValid, touched, setFieldValue }) => (
                        <Form>
                            <div className="p-fluid  grid card mt-2 ">
                                <span className=" field col-6 flex flex-column gap-2 ">
                                    <label htmlFor="firstName">First Name </label>
                                    <InputText id="firstName" name="firstName" value={values.firstName} onChange={handleChange} placeholder="First Name" className={errors.firstName ? 'error-input' : ''} />

                                    {errors.firstName ? <p className="error-label">{errors.firstName}</p> : null}
                                </span>
                                <span className="field col-6  flex flex-column gap-2">
                                    <label htmlFor="lastName">Last Name </label>
                                    <InputText id="lastName" name="lastName" value={values.lastName} onChange={handleChange} placeholder="Last Name" className={errors.lastName ? 'error-input' : ''} />
                                    {errors.lastName ? <p className="error-label">{errors.lastName}</p> : null}
                                </span>
                                <span className=" flex flex-column  gap-2  col-6">
                                    <label htmlFor="username">UserName </label>
                                    <InputText id="username" name="username" value={values.username} onChange={handleChange} placeholder="username_5" className={errors.username ? 'error-input' : ''} readOnly />
                                    {errors.username ? <p className="error-label">{errors.username}</p> : null}
                                </span>
                                <span className=" flex flex-column gap-2  col-6">
                                    <label htmlFor="email">Email </label>
                                    <InputText id="email" value={values.email} name="email" onChange={handleChange} placeholder="JohnDoe@example.com" className={errors.email ? 'error-input' : ''} />
                                    {errors.email ? <p className="error-label">{errors.email}</p> : null}
                                </span>

                                <span className=" mt-5 col-12 ">
                                    <PhoneInput
                                        placeholder="Enter phone number"
                                        value={values.phoneNumber}
                                        name="phoneNumber"
                                        onChange={(e) => setFieldValue('phoneNumber', e)}
                                        limitMaxLength={true}
                                        defaultCountry="ET"
                                        international
                                        countryCallingCodeEditable={false}
                                        className={errors.phoneNumber ? 'error-input input-phone-number' : 'input-phone-number'}
                                    />
                                    {errors.phoneNumber ? <p className="error-label">{errors.phoneNumber}</p> : null}
                                </span>

                                <span className="col-12 mt-3">
                                    <Checkbox inputId="superAdmin" name="isSuperAdmin" checked={values.isSuperAdmin} onChange={handleChange} />
                                    <label htmlFor="superAdmin" className="ml-2">
                                        is Super Admin
                                    </label>
                                </span>
                                <span className="col-6 mt-3">
                                    <Button label="Cancel" text onClick={() => setVisibleOne(false)} />
                                </span>
                                <span className="col-6 mt-3 ">
                                    <Button
                                        loading={isSubmitting}
                                        label="Update"
                                        text
                                        onClick={(e) => {
                                            setFieldValue('isSecondButton', true);
                                        }}
                                    />
                                </span>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideUserDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            Are you sure you want to delete{' '}
                            <b>
                                {user.firstName} {user.lastName}
                            </b>
                            ?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={changeStatusDialog} style={{ width: '450px' }} header="Confirm" modal footer={changeStatusRoleDialogFooter} onHide={() => setChangeStatusDialog(false)}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            Are you sure you want to{' '}
                            <b>
                                {user.isAccountLocked === false ? 'Deactivate' : 'Activate'} {user.firstName} {user.lastName}
                            </b>
                            ?
                        </span>
                    )}
                </div>
            </Dialog>

            {/* Manage Role Dialog */}
            <Dialog
                visible={manageRD}
                style={{ width: '800px' }}
                header="Manage Role"
                modal
                footer={userRoleDialogFooter}
                onHide={() => {
                    setManageRD(false);
                    setSelectedRoles();
                }}
            >
                <Accordion activeIndex={0}>
                    {selectedClient?.map((clientRoot, index) => (
                        <AccordionTab header={clientRoot?.client} key={index}>
                            <div className="p-fluid formgrid grid pt-4">
                                {clientRoot.roles?.map((role) => (
                                    <div className=" field col-4 field-checkbox" key={role?.id}>
                                        <Checkbox inputId={role?.id} value={role?.id} onChange={onRoleChange} checked={selectedRoles?.indexOf(role?.id) !== -1}></Checkbox>
                                        <label htmlFor={role?.id} className="p-checkbox-label">
                                            {role?.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </AccordionTab>
                    ))}
                </Accordion>
            </Dialog>
        </div>
    );
};

export default Users;
