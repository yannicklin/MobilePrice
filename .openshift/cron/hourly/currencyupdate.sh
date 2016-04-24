#!/bin/bash

date >> ${OPENSHIFT_LOG_DIR}/currencyupdate.log
php -f ${OPENSHIFT_REPO_DIR}/currencyUpdate.php >> ${OPENSHIFT_LOG_DIR}/currencyupdate.log 2>&1