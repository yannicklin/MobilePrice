#!/bin/bash

date >> ${OPENSHIFT_LOG_DIR}/currencyupdate.log

Hour4Epoch=$(($(date +'%s / 60 / 60')));

if [[ $(($Hour4Epoch % 4)) -eq 0 ]]; then
    'RUN CurrencyUpdate !' >> ${OPENSHIFT_LOG_DIR}/currencyupdate.log
    php -f ${OPENSHIFT_REPO_DIR}/currencyUpdate.php >> ${OPENSHIFT_LOG_DIR}/currencyupdate.log 2>&1
fi