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
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';

const PREFIX = 'UsageViewResource';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    normalText: `${PREFIX}-normalText`,
    listHeaderResource: `${PREFIX}-listHeaderResource`
};

const StyledTable = styled(Table)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        width: '100%',
    },

    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },

    [`& .${classes.normalText}`]: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: 30,
        width: 200,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.listHeaderResource}`]: {
        fontWeight: '600',
        fontSize: theme.typography.pxToRem(17),
    }
}));

/**
*
* @param {any} props Props for view usage in resources function.
* @returns {any} Returns the rendered UI for view scope usages.
*/
export default function UsageViewResource(props) {

    const { usedResourceList } = props;
    if (!usedResourceList) {
        return <CircularProgress />;
    } else {
        return (
            <StyledTable className={classes.table}>
                <TableRow>
                    <TableCell>
                        <Typography className={classes.listHeaderResource}>
                            <FormattedMessage
                                id='Scopes.Usage.UsageView.resource.usage'
                                defaultMessage='List of Resources'
                            />
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography className={classes.heading}>
                                            <FormattedMessage
                                                id='Scopes.Usage.UsageView.resource.target'
                                                defaultMessage='Target'
                                            />
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography className={classes.heading}>
                                            <FormattedMessage
                                                id='Scopes.Usage.UsageView.resource.verb'
                                                defaultMessage='Verb'
                                            />
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography className={classes.heading}>
                                            <FormattedMessage
                                                id='Scopes.Usage.UsageView.resource.revision'
                                                defaultMessage='Revision'
                                            />
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            {usedResourceList.map((resource) => (
                                <TableRow>
                                    <TableCell>
                                        <Typography className={classes.normalText}>
                                            <Typography>
                                                {resource.target}
                                            </Typography>
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography className={classes.normalText}>
                                            <Typography>
                                                {resource.verb}
                                            </Typography>
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography className={classes.normalText}>
                                            <Typography>
                                                {resource.revisionID}
                                            </Typography>
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </TableCell>
                </TableRow>
            </StyledTable>
        );
    }
}

UsageViewResource.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    usedResourceList: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};
