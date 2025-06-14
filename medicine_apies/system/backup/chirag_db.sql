#
# TABLE STRUCTURE FOR: cj_user_table
#

DROP TABLE IF EXISTS `cj_user_table`;

CREATE TABLE `cj_user_table` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `user_phone` varchar(255) NOT NULL,
  `user_address` longtext,
  `user_city` varchar(255) DEFAULT NULL,
  `user_pincode` varchar(255) DEFAULT NULL,
  `user_assistance_rating` int(2) NOT NULL DEFAULT '0',
  `user_variation_rating` int(2) NOT NULL DEFAULT '0',
  `user_suggestion` longtext,
  `user_update_count` int(1) NOT NULL DEFAULT '0',
  `user_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `del_status` int(11) NOT NULL DEFAULT '0' COMMENT '0 -> Active 1->Delete',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

INSERT INTO `cj_user_table` (`user_id`, `user_name`, `user_phone`, `user_address`, `user_city`, `user_pincode`, `user_assistance_rating`, `user_variation_rating`, `user_suggestion`, `user_update_count`, `user_created_at`, `del_status`) VALUES ('1', 'Santanu', '7980715644', 'DN 51Merlin Infinite 6th Floor, Sector 5', 'Kolkata', '700091', '4', '5', 'www', '5', '2019-02-22 16:54:50', '0');


