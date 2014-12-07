class GroupMailer < ActionMailer::Base
   default from: Rails.application.config.email

   def send_invite(group)
      @group = group
      Rails.logger.debug "Mail #{@group.email}"
      mail( 
            to: @group.email,
            subject: "Invitation to John and Hina's wedding" 
          ).deliver
   end
end
