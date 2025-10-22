/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import {Typography} from '@mui/material';
import Button from '@mui/material/Button';
import UsageIcon from '@mui/icons-material/List';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import API from 'AppData/api';
import MUIDataTable from "mui-datatables";
import CircularProgress from '@mui/material/CircularProgress';

const PREFIX = 'CertificateUsage';

const classes = {
    root: `${PREFIX}-root`,
    usageDialogHeader: `${PREFIX}-usageDialogHeader`,
    buttonIcon: `${PREFIX}-buttonIcon`
};

const Root = styled('div')(() => ({
    [`&.${classes.root}`]: {
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
    },

    [`& .${classes.usageDialogHeader}`]: {
        fontWeight: '600',
        fontSize: 'h6.fontSize',
        marginRight: 10,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    }
}));

type CertificateUsageProps = {
    certAlias: string
};

type APIMetaData = {
    id: string,
    name: string,
    context: string,
    version: string,
    provider: string
}

/**
 *
 * @param {any} props Props for usage function.
 * @returns {any} Returns the rendered UI for scope usage.
 */
export const CertificateUsage = (props: CertificateUsageProps) => {
    const { certAlias } = props;

    const [open, setOpen] = useState<boolean>(false);
    const [usageData, setUsageData] = useState<any>( []);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [count, setCount] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchUsage = (alias: string, limit: number, offset: number) => {
        setIsLoading( true);
        API.getEndpointCertificateUsage(alias, String(limit), String(offset)).then((response: any) => {
            const {list} = response.body;
            const {pagination} = response.body;
            const usageList = list.map((api: APIMetaData) => {
                const usageListItem = [];
                usageListItem.push(api.name);
                usageListItem.push(api.context);
                usageListItem.push(api.version);
                usageListItem.push(api.provider);
                return usageListItem;
            });
            setUsageData(usageList);
            setIsLoading(false);
            setCount(pagination.total);
        });
    }

    useEffect(() => {
        fetchUsage(certAlias,5,0);
    }, []);

    const changePage = (newPage: number) => {
        const offset = rowsPerPage * newPage;
        fetchUsage(certAlias, rowsPerPage, offset);
        setPage(newPage);
    };

    const changeRowsPerPage = (newRowsPerPage: number) => {
        let offset = newRowsPerPage * page;
        if (offset > count) {
            offset = 0;
        } else if (count - 1 === offset && page !== 0) {
            offset = newRowsPerPage * page - 1;
        }
        fetchUsage(certAlias, newRowsPerPage, offset);
        setRowsPerPage(newRowsPerPage);
    };

    const handleUsageOpen = () => {
        setOpen(true);
    };

    const handleUsageCancel = () => {
        setOpen(false);
    };

    const columns = [
        'API Name',
        'Context',
        'Version',
        'Provider',
    ];

    const options = {
        filterType: 'multiselect',
        selectableRows: 'none',
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        search: false,
        paginated: true,
        rowsPerPageOptions: [5, 10, 15],
        serverSide: true,
        rowsPerPage,
        count,
        page,
        onChangePage: changePage,
        onChangeRowsPerPage: changeRowsPerPage
    };


    const dialogTitle = (
        <Root className={classes.root}>
            <Typography className={classes.usageDialogHeader}>
                <FormattedMessage
                    id='APIs.details.endpoints.certificate.usage'
                    defaultMessage='Usages of certificate - '
                />
                {certAlias}
                {isLoading && (
                    <CircularProgress
                        size={24}
                        style={{ marginLeft: 15, position: "relative", top: 4 }}
                    />
                )}
            </Typography>
        </Root>
    );

    const dialogContent = (
        <div id='certificate-usage-table'>
            {/* @ts-ignore */}
            <MUIDataTable options={options} title={false} data={usageData} columns={columns}/>
        </div>
    );

    return (
        <div>
            <Button onClick={handleUsageOpen} id='certificate-usage-btn'>
                <UsageIcon />
            </Button>
            <Dialog open={open} maxWidth='xl'>
                <DialogTitle>
                    <Typography className={classes.usageDialogHeader}>
                        {dialogTitle}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {dialogContent}
                </DialogContent>
                <DialogActions>
                    <Button id='certificate-usage-cancel-btn' onClick={handleUsageCancel}>
                        <FormattedMessage
                            id='APIs.details.endpoints.certificate.usage.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
CertificateUsage.propTypes = {
    certAlias: PropTypes.string.isRequired,
};

export default CertificateUsage;
