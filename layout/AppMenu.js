/* eslint-disable @next/next/no-img-element */

import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

const AppMenu = () => {
    const model = [
        {
            label: 'Home',
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-palette',
                    to: '/'
                },
                {
                    label: 'Expense',
                    icon: 'pi pi-arrow-circle-up',
                    to: '/expense'
                },
                {
                    label: 'Sales',
                    icon: 'pi pi-cart-plus'
                },
                {
                    label: 'Balance Sheet',
                    icon: 'pi pi-align-justify'
                },
                {
                    label: 'Expense Type',
                    icon: 'pi pi-cloud-upload'
                },
                {
                    label: 'Currency',
                    icon: 'pi pi-dollar'
                },
                {
                    label: 'Bank Type',
                    icon: 'pi pi-database'
                },

                {
                    label: 'Reports',
                    icon: 'pi pi-chart-bar'
                },
                {
                    label: 'Account',
                    claim: 'Access-Management',
                    icon: 'pi pi-th-large'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
