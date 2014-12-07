class User < ActiveRecord::Base
   acts_as_authentic do |c|
        c.crypto_provider = Authlogic::CryptoProviders::Sha512
        c.merge_validates_length_of_login_field_options :within => 2..100
        c.validate_email_field = false
   end
end
