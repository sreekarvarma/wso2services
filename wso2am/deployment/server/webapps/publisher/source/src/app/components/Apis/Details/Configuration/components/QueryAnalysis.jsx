/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import EditRounded from '@mui/icons-material/EditRounded';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Container from '@mui/material/Container';
import { isRestricted } from 'AppData/AuthManager';
import Api from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import { Progress } from 'AppComponents/Shared';
import UpdateComplexity from '../../QueryAnalysis/UpdateComplexity';

const PREFIX = 'QueryAnalysis';

const classes = {
    content: `${PREFIX}-content`,
    itemWrapper: `${PREFIX}-itemWrapper`,
    FormControl: `${PREFIX}-FormControl`,
    subTitle: `${PREFIX}-subTitle`,
    subTitleDescription: `${PREFIX}-subTitleDescription`,
    flowWrapper: `${PREFIX}-flowWrapper`,
    subHeading: `${PREFIX}-subHeading`,
    heading: `${PREFIX}-heading`,
    paper: `${PREFIX}-paper`,
    editIcon: `${PREFIX}-editIcon`,
};


const Root = styled('div')(() => ({
    [`& .${classes.content}`]: {
        flexGrow: 1,
    },

    [`& .${classes.itemWrapper}`]: {
        width: 'auto',
        display: 'flex',
    },

    [`& .${classes.FormControl}`]: {
        padding: 10,
        width: '100%',
        marginTop: 0,
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.subTitle}`]: {
        marginTop: 20,
    },

    [`& .${classes.subTitleDescription}`]: {
        marginBottom: 10,
    },

    [`& .${classes.flowWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    },

    [`& .${classes.heading}`]: {
        margin: 'auto',
        color: 'rgba(0, 0, 0, 0.40)',
    },

    [`& .${classes.paper}`]: {
        padding: '10px 24px',
        width: 'auto',
    },

    [`& .${classes.editIcon}`]: {
        position: 'absolute',
        top: 8,
        right: 0,
    },
}));

const StyledDialog = styled(Dialog)(() => ({

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    }
}));

/**
 * The base component of the GraphQL Query Analysis.
 * @param {any} props The props passed to the layout
 * @returns {any} HTML representation.
 */
export default function GraphQLQueryAnalysis(props) {
    const {
        api,
        setUpdateComplexityList,
    } = props;
    const [open, setOpen] = useState(false);

    const [list, setList] = useState(null);
    const [typelist, setTypeList] = useState([]);

    /**
     * Get Summation of field's complexity value of all types
     * @param {Object of array} List
     */
    function findSummation(List) {
        const type = [...new Set(List.map((respond) => respond.type))];
        const array = [];
        type.map((respond) => {
            const ob = {};
            ob.type = respond;
            ob.summation = 0;
            List.map((obj) => {
                if (obj.type === respond) {
                    ob.summation += obj.complexityValue;
                }
                return ob;
            });
            array.push(ob);
            return array;
        });
        setTypeList(array);
    }

    /**
     * Set the Initial Complexity Values to the field's
     */

    function setInitialComplexity() {
        const apiId = api.id;
        const apiClient = new Api();
        const promisedComplexityType = apiClient.getGraphqlPoliciesComplexityTypes(apiId);
        promisedComplexityType
            .then((res) => {
                const array = [];
                res.typeList.map((respond) => {
                    respond.fieldList.map((ob) => {
                        const obj = {};
                        obj.type = respond.type;
                        obj.field = ob;
                        obj.complexityValue = 1;
                        array.push(obj);
                        return ob;
                    });
                    return array;
                });
                setList(array);
                findSummation(array);
            });
    }

    useEffect(() => {
        const apiId = api.id;
        const apiClient = new Api();
        const promisedComplexity = apiClient.getGraphqlPoliciesComplexity(apiId);
        promisedComplexity
            .then((res) => {
                setList(res.list);
                findSummation(res.list);
                if (res.list.length === 0) {
                    setInitialComplexity();
                }
            })
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    const { description } = response.body;
                    Alert.error(description);
                }
            });
    }, []);

    /**
    * Edit Custom Complexity Values
    */
    function editComplexity() {
        setUpdateComplexityList(list);
        findSummation(list);
        setOpen(false);
    }
    /**
     * set open state of the dialog box
     */
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    if (list === null) {
        return <Progress />;
    }

    return (
        (<Root>
            <Paper className={classes.paper} spacing={2}>
                <Grid container spacing={2} alignItems='flex-start'>
                    <Grid item md={12} style={{ position: 'relative', display: 'inline-flex' }}>
                        <Typography className={classes.subHeading} variant='h6'>
                            <FormattedMessage
                                id='Apis.Details.Configurartion.components.QueryAnalysis'
                                defaultMessage='Query Analysis'
                            />
                        </Typography>
                        <Typography className={classes.heading}>

                            <span>
                                <FormattedMessage
                                    id='Apis.Details.Configurartion.components.QueryAnalysis.update.complexity'
                                    defaultMessage='update complexity'
                                />
                            </span>

                        </Typography>
                        <Button
                            className={classes.editIcon}
                            size='small'
                            onClick={handleClickOpen}
                            disabled={isRestricted(['apim:api_create'], api)}
                        >
                            <EditRounded />
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <StyledDialog
                open={open}
                aria-labelledby='responsive-dialog-title'
                sx={{
                    '& .MuiDialog-container > .MuiPaper-root': {
                        width: '100%',
                        maxWidth: '65vw',
                        maxHeight: '95vh',
                    }
                }}
            >
                <DialogTitle id='responsive-dialog-title'>
                    <Typography className={classes.subHeading} variant='h4'>
                        <FormattedMessage
                            id='Apis.Details.Configurartion.components.QueryAnalysis.edit'
                            defaultMessage='Edit Complexity Values'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        <Container fixed>
                            <UpdateComplexity
                                list={list}
                                setList={setList}
                                typelist={typelist}
                            />
                        </Container>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Grid item>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={editComplexity}
                            className={classes.saveButton}
                        >

                            <FormattedMessage
                                id='Apis.Details.QyeryAnalysis.UpdateComplexity.save'
                                defaultMessage='Set'
                            />

                        </Button>
                    </Grid>
                    <Button onClick={handleClose} color='primary'>
                        <FormattedMessage
                            id='Apis.Details.Configurartion.components.QueryAnalysis.cancle.btn'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </StyledDialog>
        </Root>)
    );
}

GraphQLQueryAnalysis.propTypes = {
    api: PropTypes.shape({}).isRequired,
    setUpdateComplexityList: PropTypes.func.isRequired,
};
