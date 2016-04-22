#!/bin/bash

date >> ${OPENSHIFT_PHP_LOG_DIR}/currencyupdate.log
php ${OPENSHIFT_REPO_DIR}/currencyUpdate.php >> ${OPENSHIFT_PHP_LOG_DIR}/currencyupdate.log 2>&1