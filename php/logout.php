<?php
header('Content-Type: application/json; charset=utf-8');

session_start();

session_unset(); //Svuota $_SESSION

session_destroy(); //elimina file con dati della sessione

echo json_encode(["success" => true, "message" => "Logout effettuato"]);
?>