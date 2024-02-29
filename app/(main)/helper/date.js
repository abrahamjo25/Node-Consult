import moment from 'moment';

export const dateTemplate = (row) => {
    return <span>{moment(row.StartDate).format('MMMM DD, YYYY, hh:mm A')}</span>;
};
export const mindate = new Date('11/12/2023');
