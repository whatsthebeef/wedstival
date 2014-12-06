class User < ActiveRecord::Base
   acts_as_authentic do |c|
        c.crypto_provider = Authlogic::CryptoProviders::Sha512
   end
end
