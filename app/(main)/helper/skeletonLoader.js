// SkeletonLoader.js

import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = () => {
    return (
        <>
            <div className="">
                <ul className="card list-none p-0 m-0 md:col-12 py-5">
                    <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between">
                        <div className="md:col-2">
                            <div className="skeleton-text"></div>
                        </div>
                        <div className="mt-2 md:mt-0 flex align-items-center mr-5 ml-3">
                            <button className="skeleton-button"></button>
                        </div>
                    </li>
                </ul>
                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between">
                    <ul className="list-none p-0 m-0 md:col-4">
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div className="py-3 w-full">
                                <p className="skeleton-text"></p>
                                <div className="skeleton-text text-div"></div>
                            </div>
                            <div className="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                                <div className="surface-300 border-round overflow-hidden w-10rem lg:w-8rem" style={{ height: '8px' }}>
                                    <div className="skeleton-progress-bar"></div>
                                </div>
                                <p className="text-percent ml-4"></p>
                            </div>
                        </li>
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div className="w-full">
                                <p className="mr-8  skeleton-text"></p>
                                <div className="skeleton-text text-div"></div>
                            </div>
                            <div className="mt-2 md:mt-0 flex align-items-center">
                                <div className="surface-300 border-round overflow-hidden w-10rem lg:w-8rem" style={{ height: '8px' }}>
                                    <div className="skeleton-progress-bar"></div>
                                </div>
                                <p className="text-percent ml-4"></p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="skeleton-data-table">
                    <div className="skeleton-data-table-header"></div>
                    <div className="skeleton-data-table-row"></div>
                    <div className="skeleton-data-table-row"></div>
                    <div className="skeleton-data-table-row"></div>
                    <div className="skeleton-data-table-row"></div>
                    <div className="skeleton-data-table-row"></div>
                </div>
            </div>
        </>
    );
};

export default SkeletonLoader;
