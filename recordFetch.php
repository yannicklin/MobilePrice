<?php
/**
 * Function: get SQLite records into JSON result
 * User: Yannick Lin
 * Date: 2016/4/17
 */


// Specify your sqlite database name and path //
$sqliteFile = 'sqlite:twoudia.db';

$sqlDB = new PDO($sqliteFile) or die("cannot open database");
$sqlDB->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

try{
    $strSQL = "SELECT * FROM v_price";

	foreach($sqlDB->query($strSQL) as $row)
	{
        $result[] = $row;
	}
    echo json_encode($result);
} catch (PDOException $e) {
    echo 'Exception : '.$e->getMessage();
    exit;
}