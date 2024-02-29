'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GET } from '../../../api/service/axios/route';
import moment from 'moment';
const Page = () => {
    const [events, setEvents] = useState(null);
    const [schedulling, setSchedulling] = useState(null);
    const search = useSearchParams();
    const fileType = search.get('fileType');
    var today = moment().format('MM/DD/YYYY');
    const country = search.get('country');
    const scheduleTypes = [
        { name: 'All Days', value: 1, dateNumbers: [0, 1, 2, 3, 4, 5, 6] },
        { name: 'Working Days', value: 2, dateNumbers: [1, 2, 3, 4, 5] },
        { name: 'All Working Days', value: 3, dateNumbers: [1, 2, 3, 4, 5, 6] },
        { name: 'Saturday', value: 4, dateNumbers: [6] },
        { name: 'Sunday', value: 5, dateNumbers: [0] }
    ];
    useEffect(() => {
        getEvents(fileType, today, country).then((data) => {
            setSchedulling(data[1]?.Scheduling);
            console.log(data);
            const fullCalendarEvents = data?.map((schedule) => {
                const startDate = schedule.StartDate.split('T')[0];
                return {
                    id: schedule.Id,
                    title: schedule?.FileName,
                    start: startDate,
                    schedule: schedule.FileSchedule,
                    status: schedule.Status,
                    backgroundColor: schedule?.Status === 3 ? '#136c34' : '#DC143C',
                    borderColor: schedule?.Status === 3 ? '#136c34' : '#DC143C',
                    textColor: '#fff'
                };
            });

            setEvents(fullCalendarEvents);
        });
    }, []);
    const getEvents = async (file, date, tape) => {
        return await GET(`/api/Logfiles/Filelogdetails?FileType=${file}&Logdates=${date}&TapeName=${tape}`, '');
    };

    const customDayCellClass = ({ date }) => {
        const day = date.getDay();
        const selectedSchedule = scheduleTypes.find((schedule) => schedule.value === schedulling);
        const dateNumbers = selectedSchedule?.dateNumbers || [];

        return dateNumbers.includes(day) ? 'schedule-date-cell' : '';
    };
    const handleDatesSet = (info) => {
        const selectedDate = info.view.currentStart;
        const date = moment(selectedDate).format('MM/DD/YYYY');
        getEvents(fileType, date, country).then((data) => {
            setSchedulling(data[1]?.Scheduling);
            const fullCalendarEvents = data?.map((schedule) => {
                const startDate = schedule.StartDate.split('T')[0];
                return {
                    id: schedule.Id,
                    title: schedule?.FileName,
                    start: startDate,
                    schedule: schedule.FileSchedule,
                    status: schedule.Status,
                    backgroundColor: schedule?.Status === 3 ? '#136c34' : '#DC143C',
                    borderColor: schedule?.Status === 3 ? '#136c34' : '#DC143C',
                    textColor: '#fff'
                };
            });

            setEvents(fullCalendarEvents);
        });
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card custom-calendar">
                    {/* <h5 className="">BSP-HOT MC from UK</h5> */}
                    <FullCalendar
                        events={events}
                        initialView="dayGridMonth"
                        height={720}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'dayGridMonth,timeGridWeek,timeGridDay',
                            center: 'title',
                            right: 'prev,next'
                        }}
                        selectable
                        selectMirror
                        dayMaxEvents
                        dayCellClassNames={customDayCellClass}
                        datesSet={handleDatesSet}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
