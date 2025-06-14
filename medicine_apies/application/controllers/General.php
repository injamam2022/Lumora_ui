<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/* Handle CORS */

// Specify domains from which requests are allowed
header('Access-Control-Allow-Origin: *');

// Specify which request methods are allowed
header('Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS');

// Additional headers which may be sent along with the CORS request
header('Access-Control-Allow-Headers: X-Requested-With,Authorization,Content-Type');

// Set the age to 1 day to improve speed/caching.
header('Access-Control-Max-Age: 86400');

// Exit early so the page isn't fully loaded for options requests
if (strtolower($_SERVER['REQUEST_METHOD']) == 'options') {
    exit();
}
class General extends CI_Controller
{    
	public function __construct()
    {
        parent::__construct();
        $this->load->model('General_model');
    }

	public function index($param1)
	{
        $function_name = strtolower($param1).'_data';
		$json = file_get_contents('php://input');
		$data = json_decode($json,true);
        $result = $this->General_model->$function_name($data);
	    echo json_encode($result);
	}
}