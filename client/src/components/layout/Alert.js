import React from 'react';
import PropTypes from 'prop-types';
//always if you want something from the redus/store
import {connect} from 'react-redux';

//props.alerts
const Alert = ({alerts}) => 
    alerts !== null && 
    alerts.length > 0 && alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
        {alert.msg}
    </div>
));

alert.propTypes = {
    alerts: PropTypes.array.isRequired,
}

//redux state to prop so we can use it now props.alerts
const mapStateToProps = state => ({
    alerts: state.alert 
})

export default connect(mapStateToProps)(Alert);
