<?php
if (!defined('BASEPATH')) exit('No direct script access allowed');
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

class General_model extends CI_Model
{

    public function add_data($all_data)
    {
        $table_prefix = $this->config->item('table_prefix');
        $table_suffix = $this->config->item('table_suffix');

        $key_array = array_keys($all_data);
        $table_attribute = strtolower($key_array[0]);

        if (isset($all_data['check']) && $all_data['check'] != '') {
            $check_table_attribute_arr = explode(',', $all_data['check']);
            for ($i = 0; $i < count($check_table_attribute_arr); $i++) {
                //                $variable = $table_attribute."_".strtolower($check_table_attribute_arr[$i]);
                $variable = strtolower($check_table_attribute_arr[$i]);
                $this->db->where('' . $variable . '', $all_data['' . $key_array[0] . '']['' . $variable . '']);
            }
            $this->db->where('del_status ', 0);
            $query = $this->db->get('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
            //            echo $this->db->last_query(); die;
            $count_row = $query->num_rows();
            if ($count_row > 0) {
                return array("stat" => 405, "msg" => "Insert failed. This same value exist", "insert_id" => 0);
                die;
            }
        }

        $this->db->insert('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '', $all_data['' . $key_array[0] . '']);
        $insert_id = $this->db->insert_id();

        return array("stat" => 200, "msg" => "Added successfully", "insert_id" => $insert_id);
    }

    public function update_data($all_data)
    {
        $table_prefix = $this->config->item('table_prefix');
        $table_suffix = $this->config->item('table_suffix');

        $key_array = array_keys($all_data);
        $table_attribute = strtolower($key_array[0]);

        //        if(!isset($all_data[''.$key_array[0].''][''.$table_attribute.'_id']) && $all_data[''.$key_array[0].''][''.$table_attribute.'_id']=='')
        //        {
        //            return array("stat"=>405,"msg"=>"Please give ".$table_attribute."_id");die;
        //        }

        if (count($all_data['' . $key_array[0] . '']) == 0) {
            return array("stat" => 406, "msg" => "Please give data for update");
            die;
        }

        if (isset($all_data['where']) && $all_data['where'] != '') {
            $where = $all_data['where'];
        } else {
            $where = array();
        }

        //        echo json_encode($where);die;

        if (isset($all_data['check']) && $all_data['check'] != '') {
            $check_table_attribute_arr = explode(',', $all_data['check']);
            for ($i = 0; $i < count($check_table_attribute_arr); $i++) {
                //                $variable = $table_attribute."_".strtolower($check_table_attribute_arr[$i]);
                $variable = strtolower($check_table_attribute_arr[$i]);
                $this->db->where('' . $variable . '', $all_data['' . $key_array[0] . '']['' . $variable . '']);
            }
            if (count($where) > 0) {
                $where_key_array = array_keys($where);
                for ($j = 0; $j < count($where); $j++) {
                    $this->db->where('' . $where_key_array[$j] . '!=', $where['' . $where_key_array[$j] . '']);
                }
            }

            $this->db->where('del_status ', 0);
            $query = $this->db->get('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
            //            echo $this->db->last_query(); die;
            $count_row = $query->num_rows();
            if ($count_row > 0) {
                return array("Stat" => 407, "Msg" => "Update Failed. This same value exist", "update_id" => 0);
                die;
            }
        }

        //        $this->db->update(''.$table_prefix.''.$table_attribute.''.$table_suffix.'', $all_data[''.$key_array[0].''], array(''.$table_attribute.'_id' => $all_data[''.$key_array[0].''][''.$table_attribute.'_id']));

        $this->db->update('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '', $all_data['' . $key_array[0] . ''], $where);

        return array("stat" => 200, "msg" => "Updated Successfully");
    }

    public function get_data($all_data)
    {
        $table_prefix = $this->config->item('table_prefix');
        $table_suffix = $this->config->item('table_suffix');

        $key_array = array_keys($all_data);
        $table_attribute = strtolower($key_array[0]);

        $this->db->where($all_data['' . $key_array[0] . '']);
        $this->db->where('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '.del_status', 0);

        if (isset($all_data['join']) && $all_data['join'] != '') {
            $join_table_attribute_arr = explode(',', $all_data['join']);
            for ($i = 0; $i < count($join_table_attribute_arr); $i++) {
                $new_join_table_attribute = explode(":", $join_table_attribute_arr[$i]);
                $join_table_attribute = strtolower($new_join_table_attribute[0]);

                $this->db->join('' . $table_prefix . '' . $join_table_attribute . '' . $table_suffix . '', '' . $table_prefix . '' . $join_table_attribute . '' . $table_suffix . '.' . $join_table_attribute . '_id=' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '.' . $join_table_attribute . '_id', 'left');

                if (count($new_join_table_attribute) > 1) {
                    $sub_join_str = $new_join_table_attribute[1];
                    $sub_join_arr = explode('|', $sub_join_str);
                    if (count($sub_join_arr) > 0) {
                        for ($j = 0; $j < count($sub_join_arr); $j++) {
                            $sub_join_table_attribute = strtolower($sub_join_arr[$j]);

                            $this->db->join('' . $table_prefix . '' . $sub_join_table_attribute . '' . $table_suffix . '', '' . $table_prefix . '' . $sub_join_table_attribute . '' . $table_suffix . '.' . $sub_join_table_attribute . '_id=' . $table_prefix . '' . $join_table_attribute . '' . $table_suffix . '.' . $sub_join_table_attribute . '_id', 'left');
                        }
                    }
                }
            }
        }


        if (isset($all_data['order_by']) && $all_data['order_by'] != '') {
            $key_array_new = array_keys($all_data['order_by']);
            if (count($key_array_new) > 0) {
                if (strtolower($all_data['order_by']['' . $key_array_new[0] . '']) == 'asc' || strtolower($all_data['order_by']['' . $key_array_new[0] . '']) == 'desc') {
                    $this->db->order_by($key_array_new[0], strtolower($all_data['order_by']['' . $key_array_new[0] . '']));
                }
            }
        }


        if (isset($all_data['limit']) && $all_data['limit'] != '') {
            $limit = $all_data['limit'];
            $this->db->limit($limit);
        }
        if (isset($all_data['offset']) && $all_data['offset'] != '') {
            $offset = $all_data['offset'];
            $this->db->offset($offset);
        }

        $query = $this->db->get('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
        //		 echo $this->db->last_query(); die;
        $count_row = $query->num_rows();
        if ($count_row > 0) {
            $res = array("stat" => 200, "msg" => "All list", "list_count" => $count_row, "all_list" => $query->result_array());
        } else {
            $res = array("stat" => 500, "msg" => "No data found", "list_count" => $count_row, "all_list" => array());
        }
        return $res;
    }

    public function delete_data($all_data)
    {
        $table_prefix = $this->config->item('table_prefix');
        $table_suffix = $this->config->item('table_suffix');

        $key_array = array_keys($all_data);
        $table_attribute = strtolower($key_array[0]);

        if (!isset($all_data['' . $key_array[0] . '']['' . $table_attribute . '_id']) || $all_data['' . $key_array[0] . '']['' . $table_attribute . '_id'] == '') {
            return array("stat" => 408, "msg" => "Please give " . $table_attribute . "_id");
            die;
        }

        $this->db->where('del_status ', 0);
        $this->db->where($table_attribute . '_id ', $all_data['' . $key_array[0] . '']['' . $table_attribute . '_id']);
        $query = $this->db->get('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
        $count_row = $query->num_rows();
        if ($count_row > 0) {
            $this->db->set('del_status', '1');
            $this->db->where($table_attribute . '_id ', $all_data['' . $key_array[0] . '']['' . $table_attribute . '_id']);
            $this->db->update('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');

            return array("stat" => 200, "msg" => "Delete Successfully");
        } else {
            return array("stat" => 409, "msg" => "Delete failed. This id not exists");
        }
    }

    public function remove_data($all_data)
    {
        $table_prefix = $this->config->item('table_prefix');
        $table_suffix = $this->config->item('table_suffix');

        $key_array = array_keys($all_data);
        $table_attribute = strtolower($key_array[0]);

        if (!isset($all_data['' . $key_array[0] . ''])) {
            return array("stat" => 410, "msg" => "Please give proper data");
            die;
        }

        $this->db->where($all_data['' . $key_array[0] . '']);
        $query = $this->db->get('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
        $count_row = $query->num_rows();

        if ($count_row > 0) {
            if (count($all_data['' . $key_array[0] . '']) > 0) {
                $this->db->where($all_data['' . $key_array[0] . '']);
                $this->db->delete('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
            } else {
                $this->db->truncate('' . $table_prefix . '' . $table_attribute . '' . $table_suffix . '');
            }

            return array("stat" => 200, "msg" => "Remove Successfully");
        } else {
            return array("stat" => 411, "msg" => "Remove failed. Please try again");
        }
    }
    public function backup_data()
    {
        $dir = "system/back_up/";
        $a = scandir($dir);
        if (isset($a[2])) {
            unlink('system/backup/' . $a[2]);
        }

        $this->load->dbutil();
        $db_name = $this->db->database;

        $prefs = array(
            'format'      => 'zip',
            'filename'    => $db_name . '.sql'
        );
        $backup = $this->dbutil->backup($prefs);

        $db_name = $db_name . '.zip';
        $save = 'system/backup/' . $db_name;

        $this->load->helper('file');
        write_file($save, $backup);

        return array("stat" => 200, "msg" => "Backup Successfully");
    }




    /*my general function*/



    // for role wise module
    public function Module_access_data($data){
        if (!isset($data['role_id'])) {
            return array("stat" => 400, "msg" => "Role ID is required", "All_list" => array());
        }

        // First check if role exists
        $this->db->where('role_id', $data['role_id']);
        $this->db->where('del_status', 0);
        $role_exists = $this->db->get('role_master')->num_rows();
        
        if ($role_exists == 0) {
            return array("stat" => 404, "msg" => "Role not found", "All_list" => array());
        }

        // Get module access data
        $this->db->select('
            user_access_master.*,
            module_master.module_name,
            module_master.controller_name,
            module_master.priority_status,
            role_master.role_name
        ');
        $this->db->from('user_access_master');
        $this->db->join('role_master', 'user_access_master.role_id = role_master.role_id', 'left');
        $this->db->join('module_master', 'user_access_master.module_id = module_master.module_id', 'left');
        $this->db->where('user_access_master.role_id', $data['role_id']);
        $this->db->where('module_master.del_status', 0);
        $this->db->order_by("module_master.priority_status", 'asc');
        $this->db->order_by("user_access_master.user_access_id", 'asc');
        
        $query = $this->db->get();
        $result = $query->result_array();
        $count_row = $query->num_rows();

        // If no module access exists, initialize it
        if ($count_row == 0) {
            $init_data = array('role_id' => $data['role_id']);
            $init_result = $this->InitializeModuleAccess_data($init_data);
            
            if ($init_result['stat'] == 200) {
                // Fetch the newly initialized data
                $this->db->select('
                    user_access_master.*,
                    module_master.module_name,
                    module_master.controller_name,
                    module_master.priority_status,
                    role_master.role_name
                ');
                $this->db->from('user_access_master');
                $this->db->join('role_master', 'user_access_master.role_id = role_master.role_id', 'left');
                $this->db->join('module_master', 'user_access_master.module_id = module_master.module_id', 'left');
                $this->db->where('user_access_master.role_id', $data['role_id']);
                $this->db->where('module_master.del_status', 0);
                $this->db->order_by("module_master.priority_status", 'asc');
                $this->db->order_by("user_access_master.user_access_id", 'asc');
                
                $query = $this->db->get();
                $result = $query->result_array();
                $count_row = $query->num_rows();
            }
        }

        if ($count_row > 0) {
            // Convert fields from 0/1 to true/false
            $boolFields = ['add_status', 'edit_status', 'delete_status', 'view_status'];
            foreach ($result as &$row) {
                foreach ($boolFields as $field) {
                    $row[$field] = ($row[$field] == 1);
                }
            }
            return array("stat" => 200, "msg" => "Success", "All_list" => $result);
        } else {
            return array("stat" => 404, "msg" => "No module access data found", "All_list" => array());
        }
    }


    public function ModuleAccessSingle_data($data){

        // $this->db->where('user_access_master.role_id', $data['role_id']);
        // $this->db->where('user_access_master.module_id', $data['module_id']);
        // $this->db->where('module_master.del_status', 0);
        // $query=$this->db->join('role_master', 'user_access_master.role_id = role_master.role_id', 'left');
        // $query=$this->db->join('module_master', 'user_access_master.module_id = module_master.module_id', 'left');
        // $this->db->order_by("module_master.priority_status",'asc'); 
        // $this->db->order_by("user_access_master.user_access_id",'asc');
        // $query = $this->db->get('user_access_master');
        //  //echo $this->db->last_query(); die;
        // $result=$query->result_array();
       
        
        // $count_row = $query->num_rows();
        // if($count_row>0){
        //     $res = array("stat"=>200,"All_list"=>$result);
        // }else{
        //     $res = array("stat"=>0,"Msg"=>"No Data Found","All_list"=>array());
        // }
        // return $res;

        $this->db->where('user_access_master.role_id', $data['role_id']);
        $this->db->where('user_access_master.module_id', $data['module_id']);
        $this->db->where('module_master.del_status', 0);

        $this->db->join('role_master', 'user_access_master.role_id = role_master.role_id', 'left');
        $this->db->join('module_master', 'user_access_master.module_id = module_master.module_id', 'left');

        $this->db->order_by("module_master.priority_status", 'asc'); 
        $this->db->order_by("user_access_master.user_access_id", 'asc');

        $query = $this->db->get('user_access_master');
        $result = $query->result_array();
        $count_row = $query->num_rows();

        // ✅ Reverse the logic: Convert "0" → true, "1" → false
        $boolFields = ['add_status', 'edit_status', 'view_status', 'delete_status'];
        foreach ($result as &$row) {
            foreach ($boolFields as $field) {
                // Convert "0" → true, "1" → false
                $row[$field] = ($row[$field] === '0');
            }
        }

        if ($count_row > 0) {
            $res = array("stat" => 200, "All_list" => $result);
        } else {
            $res = array("stat" => 0, "Msg" => "No Data Found", "All_list" => array());
        }
        return $res;

        

    }

    


    //for role wise Module

   
    

    public function User_login_data($data){

        if(!isset($data['password'])){
            return array("stat" => 400, "msg" => "Please enter password");
        }

        if(!isset($data['email_id'])){
            return array("stat" => 400, "msg" => "Please enter email id");
        }

        $this->db->where("password",base64_encode($data['password']));
        $this->db->where("email_id",($data['email_id']));
        $query=$this->db->get('admin_master');
        $data = $query->result_array();

        if(count($data) > 0){
            $data[0]['access_token'] = md5(uniqid().rand(1000000, 9999999));
            $data[0]['name'] = $data[0]['admin_id'] == 1 ? 'Admin':'User';
            $data[0]['phone'] = '7430983134';
            return array("stat" => 200, "msg" => "Success","all_list"=>$data[0]);
        }else{
            
            return array("stat" => 400, "msg" => "Email or Password Incorrect");
        }
    }



  public function Process_new_data($data){

    //print_r($data); die();
     
    $process_id = $data['process_id'];
   // echo $process_id;

    // Fetch process
    $this->db->where("process_id", $process_id);
    $query = $this->db->get('process_master');
    $data_result_process = $query->row_array(); // Fetch single row
    
    if (empty($data_result_process)) {
         return array("stat" => 200, "msg" => "No Data Present","data"=>$data_result_process);
    }
    
    // Fetch all stages related to the process
    $this->db->where("process_id", $process_id);
    $query_stage = $this->db->get('stage_master');
    $stages = $query_stage->result_array();
    
    if (!empty($stages)) {
        $stage_ids = array_column($stages, 'stage_id');
    
        // Fetch tasks in a single query
        $this->db->where_in("stage_id", $stage_ids);
        $query_task = $this->db->get('task_master');
        $tasks = $query_task->result_array();
    
        if (!empty($tasks)) {
            $task_ids = array_column($tasks, 'task_id');
    
            // Fetch parameters in a single query with JOIN
            $this->db->select('pm.task_id, pm.parameter_id, pm.parameter_name, pm.parameter_description, 
                               pt.parameter_type_id, pt.parameter_type_name, pt.parameter_type_description');
            $this->db->from('parameter_master pm');
            $this->db->join('parameter_type_master pt', 'pm.parameter_type_id = pt.parameter_type_id', 'left');
            $this->db->where_in("pm.task_id", $task_ids);
            $query_param = $this->db->get();
            $parameters = $query_param->result_array();
    
            // Group parameters by task_id
            $task_parameters = [];
            foreach ($parameters as $param) {
                $task_parameters[$param['task_id']][] = $param;
            }
    
            // Attach parameters to tasks
            foreach ($tasks as &$task) {
                $task['parameters'] = $task_parameters[$task['task_id']] ?? [];
            }
        }
    
        // Group tasks by stage_id
        $stage_tasks = [];
        foreach ($tasks as $task) {
            $stage_tasks[$task['stage_id']][] = $task;
        }
    
        // Attach tasks to stages
        foreach ($stages as &$stage) {
            $stage['tasks'] = $stage_tasks[$stage['stage_id']] ?? [];
        }
    }
    
    // Attach stages to process
    $data_result_process['stages'] = $stages;
    
    // $response = [
    //     "stat" => 200,
    //     "msg" => "Success",
    //     "data" => $data_result_process
    // ];
    return array("stat" => 200, "msg" => "Success","data"=>$data_result_process);
   // echo json_encode($response);
    


  }


  public function getTasksByStageId_data($data) {
    $stage_id = $data['stage_id'];

// 1. Fetch tasks
$this->db->where("stage_id", $stage_id);
$query_task = $this->db->get('task_master');
$tasks = $query_task->result_array();

if (empty($tasks)) {
    return array("stat" => 200, "msg" => "No tasks found", "data" => []);
}

// 2. Fetch parameters with their types
$task_ids = array_column($tasks, 'task_id');

$this->db->select('pm.task_id, pm.parameter_id, pm.parameter_name, pm.parameter_description, 
                   pt.parameter_type_id, pt.parameter_type_name, pt.parameter_type_description');
$this->db->from('parameter_master pm');
$this->db->join('parameter_type_master pt', 'pm.parameter_type_id = pt.parameter_type_id', 'left');
$this->db->where_in("pm.task_id", $task_ids);
$query_param = $this->db->get();
$parameters = $query_param->result_array();

// 3. Fetch multiselect options for parameters with type_id = 5
$multiselect_parameter_ids = array_column(
    array_filter($parameters, function($param) {
        return $param['parameter_type_id'] == 5;
    }),
    'parameter_id'
);

$multi_options = [];
if (!empty($multiselect_parameter_ids)) {
    $this->db->where_in('parameter_id', $multiselect_parameter_ids);
    $query_options = $this->db->get('parameter_options_master');
    $options = $query_options->result_array();

    foreach ($options as $opt) {
        $multi_options[$opt['parameter_id']][] = [
            'parameter_options_id' => $opt['parameter_options_id'],
            'options_for_parameter' => $opt['options_for_parameter'],
            'option_selected' => $opt['option_selected'],
            'added_date' => $opt['added_date']
        ];
    }
}

// 4. Group parameters by task_id and attach options if multiselect
$task_parameters = [];
foreach ($parameters as &$param) {
    if ($param['parameter_type_id'] == 5 && isset($multi_options[$param['parameter_id']])) {
        $param['options'] = $multi_options[$param['parameter_id']];
    } else {
        $param['options'] = [];
    }

    $task_parameters[$param['task_id']][] = $param;
}

// 5. Attach parameters inside tasks
foreach ($tasks as &$task) {
    $task['parameters'] = $task_parameters[$task['task_id']] ?? [];
}

// 6. Return
return array("stat" => 200, "msg" => "Success", "data" => $tasks);

  }

//   public function getTasksByStageId_data($data) {
//     $stage_id = $data['stage_id']; // should be a single string or int

//     // Fetch tasks for the given stage_id
//     $this->db->where("stage_id", $stage_id);
//     $query_task = $this->db->get('task_master');
//     $tasks = $query_task->result_array();

//     if (empty($tasks)) {
//         return array("stat" => 200, "msg" => "No tasks found", "data" => []);
//     }

//     // Collect task IDs to fetch parameters
//     $task_ids = array_column($tasks, 'task_id');

//     // Fetch parameters with JOIN
//     $this->db->select('pm.task_id, pm.parameter_id, pm.parameter_name, pm.parameter_description, 
//                        pt.parameter_type_id, pt.parameter_type_name, pt.parameter_type_description');
//     $this->db->from('parameter_master pm');
//     $this->db->join('parameter_type_master pt', 'pm.parameter_type_id = pt.parameter_type_id', 'left');
//     $this->db->where_in("pm.task_id", $task_ids);
//     $query_param = $this->db->get();
//     $parameters = $query_param->result_array();

//     // Group parameters by task_id
//     $task_parameters = [];
//     foreach ($parameters as $param) {
//         $task_parameters[$param['task_id']][] = $param;
//     }

//     // Attach parameters to tasks
//     foreach ($tasks as &$task) {
//         $task['parameters'] = $task_parameters[$task['task_id']] ?? [];
//     }

//     return array("stat" => 200, "msg" => "Success", "data" => $tasks);
// }


public function getParametersByTaskId_data($data){
    $task_id = $data['task_id']; // Get the single task id

// Fetch parameters directly for this task
$this->db->select('pm.task_id, pm.parameter_id, pm.parameter_name, pm.parameter_description, 
                   pt.parameter_type_id, pt.parameter_type_name, pt.parameter_type_description');
$this->db->from('parameter_master pm');
$this->db->join('parameter_type_master pt', 'pm.parameter_type_id = pt.parameter_type_id', 'left');
$this->db->where('pm.task_id', $task_id);
$query_param = $this->db->get();
$parameters = $query_param->result_array();

if (empty($parameters)) {
    return array("stat" => 200, "msg" => "No parameters found", "data" => []);
}

return array("stat" => 200, "msg" => "Success", "data" => $parameters);

}



public function GetBranchingRulesForProcess_data($data){
    $process_id = $data['process_id']; // Get the process id

    // Fetch branching rules
    $this->db->select('
        brm.branching_rules_id,
        brm.process_id,
        brm.stage_id,
        sm.stage_name,
        brm.task_id,
        tm.task_name,
        brm.parameter_id,
        pm.parameter_name,
        brm.parameter_value,
        brm.target_parameter_id,
        tpm.parameter_name as target_parameter_name,
        brm.added_date
    ');
    $this->db->from('branching_rules_master brm');
    $this->db->join('stage_master sm', 'brm.stage_id = sm.stage_id', 'left');
    $this->db->join('task_master tm', 'brm.task_id = tm.task_id', 'left');
    $this->db->join('parameter_master pm', 'brm.parameter_id = pm.parameter_id', 'left');
    $this->db->join('parameter_master tpm', 'brm.target_parameter_id = tpm.parameter_id', 'left');
    $this->db->where('brm.del_status', 0);
    $this->db->where('brm.process_id', $process_id);
    $this->db->order_by('brm.added_date', 'DESC');

    $query = $this->db->get();
    $branching_rules = $query->result_array();

    if (empty($branching_rules)) {
        return array("stat" => 200, "msg" => "No branching rules found", "data" => []);
    }

    return array("stat" => 200, "msg" => "Success", "data" => $branching_rules);
}



public function AddRole_data($roleData){

    // Insert into role_master
    $role = [
        'role_name'     => $roleData['role_name'],
        'department_id' => $roleData['department_id']
    ];
    $this->db->insert('role_master', $role);
    $role_id = $this->db->insert_id();

    // Insert into role_to_facility_master
    foreach ($roleData['facilities'] as $facility_id) {
        $facility = [
            'role_id'     => $role_id,
            'facility_id' => $facility_id
        ];
        $this->db->insert('role_to_facility_master', $facility);
    }
   return array("stat" => 200, "msg" => "Data Inserted");

}

public function UpdateRole_data($payload) {
    $roleData = $payload['role'];
    
  
    
    // Update role_master
    $role = [
        'role_name'     => $roleData['role_name'],
        'department_id' => $roleData['department_id']
    ];
    $this->db->where('role_id', $roleData['role_id']);
    $this->db->update('role_master', $role);

    // Update role_to_facility_master
    // First, soft delete existing facilities
    $this->db->where('role_id', $roleData['role_id']);
    $this->db->update('role_to_facility_master', ['del_status' => 1]);

    // Then insert new facilities
    foreach ($roleData['facilities'] as $facility_id) {
        $facility = [
            'role_id'     => $roleData['role_id'],
            'facility_id' => $facility_id,
            'del_status'  => 0
        ];
        $this->db->insert('role_to_facility_master', $facility);
    }
    
   
   
    
    return array("stat" => 200, "msg" => "Data Updated Successfully");
}


public function GetRole_data(){
      $sql = "
        SELECT 
            r.role_id,
            r.role_name,
            r.department_id,
            d.department_name,
            r.added_date,
            GROUP_CONCAT(f.location_name ORDER BY f.location_name SEPARATOR ', ') AS facilities
        FROM role_master r
        LEFT JOIN department_master d ON r.department_id = d.department_id
        LEFT JOIN role_to_facility_master rf ON r.role_id = rf.role_id AND rf.del_status = 0
        LEFT JOIN facility_master f ON rf.facility_id = f.facility_id
        WHERE r.del_status = 0
        GROUP BY r.role_id
        ORDER BY r.role_id ASC
    ";

    $query = $this->db->query($sql);
    
     return array("stat" => 200, "all_list" => $query->result_array());
}

public function InitializeModuleAccess_data($data) {
    if (!isset($data['role_id'])) {
        return array("stat" => 400, "msg" => "Role ID is required");
    }

    // Get all active modules
    $this->db->where('del_status', 0);
    $modules = $this->db->get('module_master')->result_array();

    if (empty($modules)) {
        return array("stat" => 404, "msg" => "No modules found");
    }

    // Check if role already has module access entries
    $this->db->where('role_id', $data['role_id']);
    $existing = $this->db->get('user_access_master')->num_rows();

    if ($existing > 0) {
        return array("stat" => 400, "msg" => "Module access already initialized for this role");
    }

    // Insert default module access for each module
    foreach ($modules as $module) {
        $access_data = array(
            'role_id' => $data['role_id'],
            'module_id' => $module['module_id'],
            'add_status' => 0,
            'edit_status' => 0,
            'delete_status' => 0,
            'view_status' => 0,
            'del_status' => 0
        );
        $this->db->insert('user_access_master', $access_data);
    }

    return array("stat" => 200, "msg" => "Module access initialized successfully");
}

public function UpdateModuleAccess_data($data) {
    if (!isset($data['role_id']) || !isset($data['module_access'])) {
        return array("stat" => 400, "msg" => "Role ID and module access data are required");
    }

    // Start transaction
    $this->db->trans_start();

    foreach ($data['module_access'] as $access) {
        if (!isset($access['module_id'])) {
            continue;
        }

        $update_data = array(
            'add_status' => isset($access['add_status']) ? $access['add_status'] : 0,
            'edit_status' => isset($access['edit_status']) ? $access['edit_status'] : 0,
            'delete_status' => isset($access['delete_status']) ? $access['delete_status'] : 0,
            'view_status' => isset($access['view_status']) ? $access['view_status'] : 0
        );

        $this->db->where('role_id', $data['role_id']);
        $this->db->where('module_id', $access['module_id']);
        $this->db->update('user_access_master', $update_data);
    }

    // Complete transaction
    $this->db->trans_complete();

    if ($this->db->trans_status() === FALSE) {
        return array("stat" => 500, "msg" => "Failed to update module access");
    }

    return array("stat" => 200, "msg" => "Module access updated successfully");
}

public function GetProcessByRole_data($data) {
    if (!isset($data['role_id'])) {
        return array("stat" => 400, "msg" => "Role ID is required");
    }

    // Check if role is admin (assuming role_id 1 is admin)
    if ($data['role_id'] == 1) {
        // Admin can see all processes
        $this->db->select('
            pm.*,
            "available" as process_status
        ');
        $this->db->from('process_master pm');
        $this->db->where('pm.del_status', 0);
        $this->db->order_by('pm.process_id', 'DESC');
    } else {
        // For other roles, only show assigned processes
        $this->db->select('
            pm.*,
            IF(aprm.assigned_user_id IS NOT NULL, "working", "available") as process_status,
            aprm.assigned_user_id,
            aprm.step_order
        ');
        $this->db->from('process_master pm');
        $this->db->join('assign_process_to_role_master aprm', 'pm.process_id = aprm.process_id AND aprm.del_status = 0', 'left');
        $this->db->where('pm.del_status', 0);
        $this->db->where('aprm.role_id', $data['role_id']);
        $this->db->order_by('pm.process_id', 'DESC');
    }

    $query = $this->db->get();
    $result = $query->result_array();

    if (empty($result)) {
        return array("stat" => 404, "msg" => "No processes found", "all_list" => array());
    }

    return array("stat" => 200, "msg" => "Success", "all_list" => $result);
}

public function GetElogByRole_data($data) {
    if (!isset($data['role_id'])) {
        return array("stat" => 400, "msg" => "Role ID is required");
    }

    // Check if role is admin (assuming role_id 1 is admin)
    if ($data['role_id'] == 1) {
        // Admin can see all processes
        $this->db->select('
            em.*,
            "available" as elogs_status
        ');
        $this->db->from('elogs_master em');
        $this->db->where('em.del_status', 0);
        $this->db->order_by('em.elogs_id', 'DESC');
    } else {
        // For other roles, only show assigned processes
        $this->db->select('
            em.*,
            IF(aprm.assigned_user_id IS NOT NULL, "working", "available") as elogs_status,
            aprm.assigned_user_id,
            aprm.step_order
        ');
        $this->db->from('elogs_master em');
        $this->db->join('assign_elogs_to_role_master aprm', 'em.elogs_id = aprm.elogs_id AND aprm.del_status = 0', 'left');
        $this->db->where('em.del_status', 0);
        $this->db->where('aprm.role_id', $data['role_id']);
        $this->db->order_by('em.elogs_id', 'DESC');
    }

    $query = $this->db->get();
    $result = $query->result_array();

    if (empty($result)) {
        return array("stat" => 404, "msg" => "No Elogs found", "all_list" => array());
    }

    return array("stat" => 200, "msg" => "Success", "all_list" => $result);
}

public function CheckProcessStatus_data($data) {
    if (!isset($data['process_id']) || !isset($data['role_id'])) {
        return array("stat" => 400, "msg" => "Process ID and Role ID are required");
    }

    // Check if process exists and get its status
    $this->db->select('
        pm.process_id,
        pm.process_name,
        aprm.assigned_user_id,
        aprm.step_order,
        am.admin_name as assigned_user_name,
        am.email_id as assigned_user_email
    ');
    $this->db->from('process_master pm');
    $this->db->join('assign_process_to_role_master aprm', 'pm.process_id = aprm.process_id AND aprm.del_status = 0', 'left');
    $this->db->join('admin_master am', 'aprm.assigned_user_id = am.admin_id', 'left');
    $this->db->where('pm.process_id', $data['process_id']);
    $this->db->where('pm.del_status', 0);

    // Only check role assignment for non-admin roles
    if ($data['role_id'] != 1) {
        $this->db->where('aprm.role_id', $data['role_id']);
    }
    
    $query = $this->db->get();
    $result = $query->row_array();

    if (!$result) {
        return array("stat" => 404, "msg" => "Process not found");
    }

    $status = array(
        "process_id" => $result['process_id'],
        "process_name" => $result['process_name'],
        "status" => $result['assigned_user_id'] ? "working" : "available",
        "assigned_user_id" => $result['assigned_user_id'],
        "assigned_user_name" => $result['assigned_user_name'],
        "assigned_user_email" => $result['assigned_user_email'],
        "step_order" => $result['step_order']
    );

    return array("stat" => 200, "msg" => "Success", "all_list" => $status);
}

public function AssignProcessToUser_data($data) {
    if (!isset($data['process_id']) || !isset($data['role_id']) || !isset($data['assigned_user_id'])) {
        return array("stat" => 400, "msg" => "Process ID, Role ID, and Assigned User ID are required");
    }

    // Start transaction
    $this->db->trans_start();

    // First check if process is available
    $this->db->select('aprm.*');
    $this->db->from('assign_process_to_role_master aprm');
    $this->db->where('aprm.process_id', $data['process_id']);
    $this->db->where('aprm.role_id', $data['role_id']);
    $this->db->where('aprm.del_status', 0);
    $query = $this->db->get();
    $process = $query->row_array();

    if (!$process) {
        return array("stat" => 404, "msg" => "Process not assigned to this role");
    }

    // Check if process is already assigned to someone else
    if ($process['assigned_user_id'] !== null && $process['assigned_user_id'] != $data['assigned_user_id']) {
        return array("stat" => 400, "msg" => "Process is already assigned to another user");
    }

    // Update the process assignment
    $update_data = array(
        'assigned_user_id' => $data['assigned_user_id'],
        'status' => 'in_progress'
    );

    $this->db->where('assign_process_to_role_id', $process['assign_process_to_role_id']);
    $this->db->update('assign_process_to_role_master', $update_data);

    // Complete transaction
    $this->db->trans_complete();

    if ($this->db->trans_status() === FALSE) {
        return array("stat" => 500, "msg" => "Failed to assign process");
    }

    return array("stat" => 200, "msg" => "Process assigned successfully");
}

public function Save_parameters_data($parameters) {
    if (!isset($parameters['elog_id'])) {
        return array("stat" => 400, "msg" => "Elog ID is required");
    }

    $elog_id = $parameters['elog_id'];
    $params = $parameters['parameters'];

    $this->db->trans_start();
    
    foreach ($params as $param) {
        // Skip empty parameters
        if (empty($param['parameter_name']) || empty($param['parameter_type_id'])) {
            continue;
        }

        // Insert into parameter master
        $param_data = array(
            'elogs_id' => $elog_id,
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
        return array("stat" => 500, "msg" => "Failed to save parameters");
    }
    return array("stat" => 200, "msg" => "Parameters saved successfully");
}

public function get_parameters_data() {
    $this->db->select('p.*, GROUP_CONCAT(o.option_value) as options');
    $this->db->from('param_master p');
    $this->db->join('param_option_master o', 'p.param_id = o.param_id', 'left');
    $this->db->where('p.status', 1);
    $this->db->group_by('p.param_id');
    $query = $this->db->get();
    
    if ($query->num_rows() > 0) {
        return array("stat" => 200, "msg" => "Parameters retrieved successfully", "data" => $query->result_array());
    } else {
        return array("stat" => 404, "msg" => "No parameters found", "data" => array());
    }
}

}
