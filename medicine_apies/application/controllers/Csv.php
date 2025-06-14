<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Csv extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	public function __construct(){
        parent::__construct();
        $this->load->model('Csv_model');
      }



	public function AddProductCsv()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json,true);
	
		
			$result = $this->Csv_model->add_product_csv($data['Product']);
			if($result>0){
		    	$res = array("Stat"=>1,"Msg"=>"Product Added Successfully","Last_insert_id"=>$result);
		    }else{
		    	$res = array("Stat"=>0,"Msg"=>"Error:Insert Failed. This product code already exist","Last_insert_id"=>0);
		    }
		
	    echo json_encode($res);
	}
    
   
}
