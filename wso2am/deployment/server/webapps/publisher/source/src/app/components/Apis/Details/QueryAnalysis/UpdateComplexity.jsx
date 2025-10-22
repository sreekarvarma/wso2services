/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Box from '@mui/material/Box';

const PREFIX = 'UpdateComplexity';

const classes = {
    searchWrapper: `${PREFIX}-searchWrapper`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.searchWrapper}`]: {
        width: '100%',
        marginBottom: theme.spacing(2),
    }
}));

/**
 *
 * @param {any} props The props passed to the layout
 * @returns {any} HTML representation.
 */
export default function UpdateComplexity(props) {

    const [filterKeyWord, setFilter] = useState('');
    const {
        setList, typelist, list,
    } = props;
    const intl = useIntl();
    /**
     * Filter the information by Types.
     */

    const setFilterByKeyWord = (event) => {
        setFilter(event.target.value.toLowerCase());
    };

    return (
        (<Root>
            <Grid item md={5}>
                <Box mt={4} pb={2}>
                    <div className={classes.searchWrapper}>
                        <TextField
                            id='outlined-full-width'
                            label={intl.formatMessage({
                                id: 'Apis.Details.QueryAnalysis.UpdateComplexity.type.label',
                                defaultMessage: 'Type',
                            })}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.QueryAnalysis.UpdateComplexity.type.placeholder',
                                defaultMessage: 'Search By Types',
                            })}
                            onChange={(e) => setFilterByKeyWord(e, typelist)}
                            fullWidth
                            variant='outlined'
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                </Box>
            </Grid>
            <Grid item md={12}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant='subtitle2'>
                                    <FormattedMessage
                                        id='Apis.Details.QueryAnalysis.UpdateComplexity.typeName'
                                        defaultMessage='Type'
                                    />
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant='subtitle2'>
                                    <FormattedMessage
                                        id='Apis.Details.QueryAnalysis.UpdateComplexity.fieldcomplexity'
                                        defaultMessage='Fields'
                                    />
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant='subtitle2'>
                                    <FormattedMessage
                                        id='Apis.Details.QueryAnalysis.UpdateComplexity.fieldcomplexitysum'
                                        defaultMessage='Sum of the Complexity'
                                    />
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {typelist.filter(
                            (item) => item.type.toLowerCase().includes(filterKeyWord),
                        ).map((typename) => {
                            return (
                                <TableRow style={{ borderStyle: 'hidden' }}>
                                    <TableCell>
                                        <Typography variant='body1'>
                                            {typename.type}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls='panel1a-content'
                                                id='panel1a-header'
                                            />
                                            <AccordionDetails>
                                                <Grid item md={12}>
                                                    <Table>
                                                        <TableRow>
                                                            <TableCell>
                                                                <b>
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.QueryAnalysis.'
                                                                            + 'UpdateComplexity.table.field'}
                                                                        defaultMessage='Field'
                                                                    />
                                                                </b>
                                                            </TableCell>
                                                            <TableCell>
                                                                <b>
                                                                    <FormattedMessage
                                                                        id={'Apis.Details.QueryAnalysis.'
                                                                            + 'UpdateComplexity.table.complexity.value'}
                                                                        defaultMessage='ComplexityValue'
                                                                    />
                                                                </b>
                                                            </TableCell>
                                                        </TableRow>
                                                        {list.map((respond, index) => ((respond.type === typename.type)
                                                     && (
                                                         <TableRow>
                                                             <TableCell>
                                                                 {respond.field}
                                                             </TableCell>
                                                             <TableCell>
                                                                 <TextField
                                                                     id='complexityValue'
                                                                     label='complexityValue'
                                                                     margin='normal'
                                                                     variant='outlined'
                                                                     value={respond.complexityValue}
                                                                     onChange={(event) => {
                                                                         const newArr = [...list];
                                                                         newArr[index] = {
                                                                             type: respond.type,
                                                                             field: respond.field,
                                                                             complexityValue: +event.target.value,
                                                                         };
                                                                         setList(newArr);
                                                                     }}
                                                                 />
                                                             </TableCell>
                                                         </TableRow>
                                                     )))}
                                                    </Table>
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant='body1'>
                                            {typename.summation}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Grid>
        </Root>)
    );
}

UpdateComplexity.propTypes = {
    setList: PropTypes.func.isRequired,
    list: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            field: PropTypes.string,
            complexityValue: PropTypes.number,
        }),
    ).isRequired,
    typelist: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            summation: PropTypes.number,
        }),
    ).isRequired,
};
