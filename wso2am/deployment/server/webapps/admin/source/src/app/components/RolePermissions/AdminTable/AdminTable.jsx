/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useIntl } from 'react-intl';
import { TableContextProvider } from './AdminTableContext';

/**
 *
 *
 * @export
 * @returns
 */
export default function AdminTable(props) {
    const {
        children, multiSelect, rowsPerPageOptions, dataIDs,
    } = props;
    const intl = useIntl();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('role');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = dataIDs.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TableContextProvider value={{
            onSelectAllClick: handleSelectAllClick,
            order,
            orderBy,
            numSelected: selected.length,
            rowCount: dataIDs.length,
            onRequestSort: handleRequestSort,
            multiSelect,
            selected,
            setSelected,
            rowsPerPage,
            page,
        }}
        >
            <div style={{ width: '100%' }}>
                <TableContainer>
                    <Table
                        role='presentation'
                        size='medium'
                        aria-label='enhanced table'
                    >
                        {children}
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={rowsPerPageOptions || [5, 10, 40]} // use default prop
                        component='div'
                        count={dataIDs.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelDisplayedRows={({ from, to, count }) => {
                            if (count !== -1) {
                                return intl.formatMessage({
                                    id: 'Role.permissions.Role.Permissions.Admin.Table.displayed.rows.range.label',
                                    defaultMessage: '{from}-{to} of {count}',
                                },
                                { from, to, count });
                            }
                            return intl.formatMessage({
                                id: 'Role.permissions.Role.Permissions.Admin.Table.displayed.rows.more.than.label',
                                defaultMessage: 'more than {to}',
                            },
                            { to });
                        }}
                        labelRowsPerPage={intl.formatMessage({
                            id: 'Role.permissions.Role.Permissions.Admin.Table.row.per.page.label',
                            defaultMessage: 'Rows per page:',
                        })}
                    />
                </TableContainer>

            </div>
        </TableContextProvider>
    );
}
