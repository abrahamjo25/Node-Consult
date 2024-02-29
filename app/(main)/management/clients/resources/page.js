'use client';
import React, { useEffect, useState, useRef } from 'react';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Accordion, AccordionTab } from 'primereact/accordion';
// import SnipperModal from '../../../styles/SnipperModal';
import { useClientStore } from '../../../../../utilities/store/index';
import { DELETE, GET, PATCH, POST, PUT } from '../../../../api/service/auth/route';
export default function ApiResources() {
    const [clientStore] = useClientStore((state) => [state.id]);

    const [clientData, setClientData] = useState(null);

    useEffect(() => {
        setClientData(clientStore);
    }, []);

    const toast = useRef(null);

    const [services, setServices] = useState([]);
    const [prevClaims, setPrevClaims] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [allSelectedClaims, setAllSelectedClaims] = useState([]);
    const [client, setClient] = useState();
    const [loading, setLoading] = useState(false);
    const [performingAction, setPerformingAction] = useState(false);

    const getIndex = (arr, value) => {
        let returnValue = -1;
        arr?.map((v, i) => {
            if (value == v[0]) {
                returnValue = i;
            }
        });

        return returnValue;
    };

    const extractServices = (apiClaims) => {
        let services = [];
        let _service = { claim: '', id: 0 };
        let selectedServices = [];
        let selectedClaims = [];

        apiClaims?.map((apiClaim) => {
            let serviceName = apiClaim?.service?.name;
            let index = getIndex(services, serviceName);
            if (index === -1) {
                services[services.length] = [serviceName, []];
                index = getIndex(services, serviceName);
            }
            _service.id = apiClaim?.id;
            _service.claim = apiClaim?.claim;
            services[index][1]?.push(_service);
            _service = {};
        });
        services.map((key) => selectedServices.push(key[1]));

        selectedServices.map((key) => key.map((index) => allSelectedClaims.push(index)));
        setServices(services);
        setLoading(false);
    };

    const getClaimsForClient = (id) => {
        setLoading(true);
        GET(`/api/v1/Client/GetById?id=${id}`)
            .then((res) => {
                const prevClaims = res.data?.clientApiResourses?.map((value) => {
                    return value?.apiClaim?.id;
                });
                setPrevClaims(prevClaims);
                setClient(res.data);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const checkAllSelection = () => {
        if (prevClaims.length === allSelectedClaims.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    };
    const onSelectAllChange = (e) => {
        if (e.checked) {
            let _Claims = [];
            for (let i = 0; i < allSelectedClaims.length; i++) {
                _Claims.push(allSelectedClaims[i].id);
            }

            setPrevClaims(_Claims);
        } else setPrevClaims([]);

        setSelectAll(e.checked);
    };

    const onClaimChange = (e) => {
        let _apiClaims = [...prevClaims];

        if (e.checked) _apiClaims.push(e.value);
        else _apiClaims.splice(_apiClaims.indexOf(e.value), 1);
        setPrevClaims(_apiClaims);
    };
    useEffect(() => {
        checkAllSelection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevClaims, allSelectedClaims]);
    const fetchAPIServices = () => {
        setLoading(true);

        GET(`/api/v1/ApiClaim/GetAll`)
            .then((res) => {
                extractServices(res.data);
            })
            .catch(() => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAPIServices();
        getClaimsForClient(clientStore?.id);
    }, []);

    const updateClientAPIClaims = () => {
        setPerformingAction(true);
        setLoading(true);

        let _client = client;
        _client['apiClaims'] = prevClaims;
        delete _client['clientApiResourses'];

        PATCH(_client, `/api/v1/Client/Update?id=${client?.id}`)
            .then(() => {})
            .catch((err) => {
                toast.current.show({ severity: 'error', summary: 'Error Message', detail: `${err.response.data.errors[0]}`, life: 4000 });
            })
            .finally(() => {
                setPerformingAction(false);
                setLoading(false);
                getClaimsForClient(clientStore?.id);
            });
    };

    return (
        <div className="card">
            {/* {loading ? <Snipper /> : <> </>} */}
            <div className="card">
                <h4>[ {clientData?.clientName} ] API Resources</h4>
            </div>
            {/* {performingAction ? <Button label="Submit" icon="pi pi-spin pi-spinner" className="mb-2"></Button> : <Button label="Submit" icon="pi pi-check" className="p-button-raised mb-4" disabled={loading} onClick={() => updateClientAPIClaims()} />} */}
            <Toast ref={toast} />

            <ScrollPanel style={{ width: '100%', height: '500px' }} className="apiClaimScroll">
                <Accordion>
                    {services?.map((service, index) => (
                        <AccordionTab header={service[0]} key={index}>
                            <label htmlFor="ApiResource">
                                Resource *
                                <Checkbox inputId="binary" className="ml-3" checked={selectAll} onChange={onSelectAllChange} />
                                <label htmlFor="binary" className="p-checkbox-label ml-1">
                                    Select All
                                </label>
                            </label>
                            <div className="p-fluid formgrid grid pt-4" key={index}>
                                {service[1]?.map((claim, index) => (
                                    <div className=" field col-4 field-checkbox" key={index}>
                                        <Checkbox inputId={claim?.id} value={claim?.id} onChange={onClaimChange} checked={prevClaims?.indexOf(claim?.id) !== -1}></Checkbox>
                                        <label htmlFor={claim?.id} className="p-checkbox-label">
                                            {claim?.claim}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </AccordionTab>
                    ))}
                </Accordion>
            </ScrollPanel>

            {performingAction ? (
                <Button label="Updating" icon="pi pi-spin pi-spinner" className="mt-4"></Button>
            ) : (
                <Button label="Submit" icon="pi pi-check" className="p-button-raised mt-4" disabled={loading} onClick={() => updateClientAPIClaims()} />
            )}
        </div>
    );
}
