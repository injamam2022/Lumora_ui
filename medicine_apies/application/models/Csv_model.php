<?php
if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Csv_model extends CI_Model {
    
   

    public function add_product_csv($data){
        $coupon_id = 0;
        for($i=0; $i<count($data); $i++){
        $product_code = $data[$i]['product_code'];

        $this->db->where('product_code',$product_code);
        $this->db->where('del_status ', 0);
        $query = $this->db->get('product_master');
        $count_row = $query->num_rows();
        $product_array = $query->result_array();
        
//        echo $this->db->last_query(); die;
            if ($count_row == 0) {
                $this->db->insert('product_master',$data[$i]);
                $product_id = $this->db->insert_id();
            }else{
                $pro_id = $product_array[0]['product_id'];
                $this->db->update('product_master', $data[$i], array('product_id' => $pro_id));
                $product_id = $pro_id;
            }
        }
            return  $product_id;
    }
    
   
}
?>