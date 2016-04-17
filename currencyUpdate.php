<?php
/**
 * Function: Update SQLite - Currency Exchange Rate with https://openexchangerates.org/api/
 * User: Yannick Lin
 * Date: 2016/4/17
 */

// Specify your sqlite database name and path //
$sqliteFile = 'sqlite:mydir/myDatabase.sqlite';
$sqlDB = new PDO($sqliteFile) or die("cannot open database");
$strSQL = "INSERT OR REPLACE INTO exchangerate(currency, rate, recdate) VALUES(:currency, :rate, :recdate);";
$objQuery = $DB->prepare($strSQL);

$jsonFile = file_get_contents('https://openexchangerates.org/api/latest.json?app_id=c085701d99944612b4003f84c3764416');
$jsonArray = json_decode($jsonFile, true);

// loop through the array
foreach ($jsonArray->rate as $row) {
    // get the employee details
    foreach ($row as $key=>$value) {
        // execute insert query
        try{
            $objQuery->bindParam(':currency', $key, PDO::PARAM_STR);
            $objQuery->bindParam(':rate', $value, PDO::PARAM_STR);
            $objQuery->bindParam(':recdate', date('Y-m-d H:i:s'), PDO::PARAM_STR);
            $objQuery->execute();
        } catch(PDOException $e){
            echo 'Exception : '.$e->getMessage();
        }

    }
}





// Specify your sqlite database name and path //
$dir = 'sqlite:mydir/myDatabase.sqlite';

// Instantiate PDO connection object and failure msg //
$dbh = new PDO($dir) or die("cannot open database");

// Define your SQL statement //
$query = "SELECT * FROM myTable";

// Iterate through the results and pass into JSON encoder //
foreach ($dbh->query($query) as $row) {
    echo json_encode($row[0]);
}