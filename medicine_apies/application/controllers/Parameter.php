<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Parameter extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('General_model');
    }

    public function save() {
        // Get JSON input
        $json = file_get_contents('php://input');
        $parameters = json_decode($json, true);

        if (!$parameters) {
            $this->output
                ->set_content_type('application/json')
                ->set_status_header(400)
                ->set_output(json_encode(['status' => 'error', 'message' => 'Invalid JSON data']));
            return;
        }

        $result = $this->General_model->save_parameters_data($parameters);

        $this->output
            ->set_content_type('application/json')
            ->set_status_header($result['stat'])
            ->set_output(json_encode($result));
    }

    public function get() {
        $result = $this->General_model->get_parameters_data();
        
        $this->output
            ->set_content_type('application/json')
            ->set_status_header($result['stat'])
            ->set_output(json_encode($result));
    }
} 