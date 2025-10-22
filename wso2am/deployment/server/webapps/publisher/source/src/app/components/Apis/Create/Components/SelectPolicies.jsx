import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';

const PREFIX = 'SelectPolicies';

const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`
};

const StyledTextField = styled(TextField)((
    {
        theme
    }
) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: 'red', // theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    }
}));

/**
 * Trottling Policies dropdown selector used in minimized API Create form
 * @export
 * @param {*} props
 * @returns {React.Component}
 */
export default function SelectPolicies(props) {
    const {
        onChange, policies: selectedPolicies, multiple, helperText, isAPIProduct, validate,
    } = props;
    const [policies, setPolicies] = useState({});

    useEffect(() => {
        API.policies('subscription').then((response) => setPolicies(response.body));
    }, []);
    const handleValidateAndChange = ({ target: { value, name } }) => {
        validate('policies', value);
        onChange({ target: { name, value } });
    };
    if (!policies.list) {
        return <CircularProgress />;
    } else {
        return (
            <StyledTextField
                fullWidth
                select
                label={(
                    <>
                        <FormattedMessage
                            id='Apis.Create.Components.SelectPolicies.business.plans'
                            defaultMessage='Business plan(s)'
                        />
                        {isAPIProduct && (<sup className={classes.mandatoryStar}>*</sup>)}
                    </>
                )}
                value={selectedPolicies}
                name='policies'
                onChange={handleValidateAndChange}
                SelectProps={{
                    multiple,
                    renderValue: (selected) => (Array.isArray(selected) ? selected.join(', ') : selected),
                }}
                helperText={helperText}
                margin='normal'
                variant='outlined'
                InputProps={{
                    id: 'itest-id-apipolicies-input',
                }}
                InputLabelProps={{
                    for: 'itest-id-apipolicies-input',
                }}
            >
                {policies.list.filter((policy) => !policy.name.includes(CONSTS.DEFAULT_SUBSCRIPTIONLESS_PLAN))
                    .map((policy) => (
                        <MenuItem
                            dense
                            disableGutters={multiple}
                            id={policy.name}
                            key={policy.name}
                            value={policy.displayName}
                        >
                            {multiple && <Checkbox color='primary' checked={selectedPolicies.includes(policy.name)} />}
                            <ListItemText primary={policy.displayName} secondary={policy.description} />
                        </MenuItem>
                    ))}
            </StyledTextField>
        );
    }
}

SelectPolicies.defaultProps = {
    policies: [],
    multiple: true,
    required: false,
    isAPIProduct: PropTypes.bool.isRequired,
    helperText: 'Select one or more throttling policies for the ',
};
