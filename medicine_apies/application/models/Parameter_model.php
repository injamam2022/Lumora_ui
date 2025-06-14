<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Parameter_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function save_parameters($parameters) {
        $this->db->trans_start();
        
        foreach ($parameters as $param) {
            // Skip empty parameters
            if (empty($param['parameter_name']) || empty($param['parameter_type_id'])) {
                continue;
            }

            // Insert into parameter master
            $param_data = array(
                'parameter_name' => $param['parameter_name'],
                'parameter_description' => $param['parameter_description'],
                'parameter_type_id' => $param['parameter_type_id'],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
                'status' => 1
            );

            $this->db->insert('param_master', $param_data);
            $param_id = $this->db->insert_id();

            // Insert multi-select options if any
            if (!empty($param['multiSelectOptions'])) {
                foreach ($param['multiSelectOptions'] as $option) {
                    $option_data = array(
                        'param_id' => $param_id,
                        'option_value' => $option,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                        'status' => 1
                    );
                    $this->db->insert('param_option_master', $option_data);
                }
            }
        }

        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        return true;
    }

    public function get_parameters() {
        $this->db->select('p.*, GROUP_CONCAT(o.option_value) as options');
        $this->db->from('param_master p');
        $this->db->join('param_option_master o', 'p.param_id = o.param_id', 'left');
        $this->db->where('p.status', 1);
        $this->db->group_by('p.param_id');
        $query = $this->db->get();
        return $query->result();
    }
} 