<?php
if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class ProductInfo_model extends CI_Model {
    
    
    
   

    public function add_product_info($data){
       
           $flag =0;
            if(count($data)>0){
                $flag =1;
                $information_idArr ='';
                for($i=0;$i<count($data);$i++)
                {

                    $this->db->where('del_status', 0);
                    $this->db->where('name', $data[$i]['name']);
                    $this->db->where('product_id', $data[$i]['product_id']);
                    $this->db->where('info', $data[$i]['info']);
                    $query1 = $this->db->get('information_master');
                    
//                    echo $this->db->last_query(); die;
                    $count_row1 = $query1->num_rows();
                    
                    if($count_row1 == 0)
                    {
                         $this->db->insert('information_master',$data[$i]);
    			         $information_id = $this->db->insert_id();
                        $information_idArr.=$information_id.',';
                        
                    }
                    else
                    {
                        
                        continue;
                    }
                }
            }
        
        if($flag==1){
            if($information_idArr == ''){
                $res = array("stat"=>0,  "msg"=>"Data already Added");
                             
            }else{
                $res = array("stat"=>1, "idList"=>$information_idArr, "msg"=>"inserted data list");
            }
        }else{
                $res = array("stat"=>0,  "msg"=>"No data List found");
            }

            
        
        return $res;
	       
   		}
    
    public function get_product_info($data)
    {

        
    if(isset($data['product_id'])){
			$product_id = $data['product_id'];
			$this->db->where('product_id', $product_id);
			$this->db->where('del_status', 0);
		}else{
			$this->db->where('del_status', 0);
		}
		$query = $this->db->get('information_master');
//		 echo $this->db->last_query(); die;
        $result=$query->result_array();
        

        $Leftarray=array();
        $rightarrays=array();
        if(count($result)>0)
        {
            for($i=0;$i<count($result);$i++)
            {
                if($result[$i]['position_status']==1)
                {
                    $Leftarray[]=$result[$i];
                    
                    
                }
                else 
                {
                     $rightarrays[]=$result[$i];
                }
                
            }
        }
        
            
            
		$count_row = $query->num_rows();
		if($count_row>0){
			$res = array("stat"=>200,"List_count"=>$count_row,"Left"=>$Leftarray,"Right"=>$rightarrays);
		}else{
			$res = array("stat"=>0,"Msg"=>"No Data Found","List_count"=>$count_row,"All_list"=>array());
		}
		return $res;

	
        
    }
    
   
}
?>