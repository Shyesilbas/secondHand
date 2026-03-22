package com.serhat.secondhand.complaint.application;

import com.serhat.secondhand.complaint.ComplaintDto;
import com.serhat.secondhand.complaint.ComplaintRequest;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;

public interface IComplaintService {
    
    Result<ComplaintDto> createComplaint(Long userId, ComplaintRequest complaintRequest);
    
    List<ComplaintDto> getUserComplaints(User user);
    
    List<ComplaintDto> getComplaintsAboutUser(User user);
}
