#!/bin/bash

date >> ${OPENSHIFT_PHP_LOG_DIR}/currencyupdate.log
php -f ${OPENSHIFT_REPO_DIR}/currencyUpdate.php >> ${OPENSHIFT_PHP_LOG_DIR}/currencyupdate.log 2>&1