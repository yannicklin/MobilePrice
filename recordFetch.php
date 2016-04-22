<?php
/**
 * Function: get SQLite records into JSON result
 * User: Yannick Lin
 * Date: 2016/4/17
 * Special Note: About SQL statement build up, using single quote rather than double quote, due to the use of inches
 */
if (empty($_GET["table"])) exit;

// Specify your sqlite database name and path //
$sqliteFile = 'sqlite:twoudia.db';

try {
    $sqlDB = new PDO($sqliteFile);
    $sqlDB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $strSQL = "SELECT * FROM " . $_GET["table"];
    if ($_GET["cond"]=='y') {
        $strSQL .= " WHERE 1 = 1";
        foreach ($_GET as $key => $value) {
            if (!in_array($key, array('table','cond'), true )) $strSQL .= " and ".$key."='".$value."'";
        }
    }
    //echo "SQL statement is : ".$strSQL."<br />";
    $smst = $sqlDB->prepare($strSQL);
    $smst->execute();

    echo json_encode($smst->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo 'Exception : ' . $e->getMessage();
    exit;
}