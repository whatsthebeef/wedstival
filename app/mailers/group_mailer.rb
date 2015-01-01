class GroupMailer < ActionMailer::Base
   default from: Rails.configuration.email

   def send_invite(group)
      if group.email.blank? then raise Exception end
      @group = group
      Rails.logger.debug "Mail #{@group.email}"
      mail( 
           to: @group.email,
           subject: "Invitation to John and Hina's wedding" 
          ).deliver
   end
end
