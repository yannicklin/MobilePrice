<?php
/**
 * Function: get SQLite records into JSON result
 * User: Yannick Lin
 * Date: 2016/4/17
 */

// Specify your sqlite database name and path //
$sqliteFile = 'sqlite:mydir/myDatabase.sqlite';
$sqlDB = new PDO($sqliteFile) or die("cannot open database");
$strSQL = "SELECT * FROM myTable";
$objQuery = $DB->prepare($strSQL);

// Iterate through the results and pass into JSON encoder //
try{
    // Iterate through the results and pass into JSON encoder //
    foreach ($objQuery->execute() as $row) {
        echo json_encode($row[0]);
    }
} catch(PDOException $e){
    echo 'Exception : '.$e->getMessage();
}