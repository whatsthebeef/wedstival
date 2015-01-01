require 'zlib'
class Group < ActiveRecord::Base
   before_validation :generate_code

   has_many :guests, dependent: :destroy
   accepts_nested_attributes_for :guests

   validates :name, presence: true
   validates :code, presence: true
   validates :name, uniqueness: true
   validates :code, uniqueness: true
   validates :email, uniqueness: true, allow_blank: true

   def generate_code 
      if code.blank?
         self.code = Digest::SHA1.hexdigest "#{name}#{Rails.configuration.hash_string}"
      end
   end

   def self.last_five 
      where(has_submitted:true).limit(5).order("id desc").reverse
   end

   def send_invite
      GroupMailer.send_invite(self)
      self.received_invite = true
      save!
   end

   def size
      guests.size
   end

   def just_one
      size == 1
   end

   def empty
      size == 0
   end

   def whose_coming
      count = 0
      coming = guests.select {|g| g.is_coming}.map { |g| 
         count = count + 1
         g.name
      }.to_sentence
      %{#{coming == "" ? "No one " : "#{coming} "} #{count > 1 ? "are" : " is"} coming.}
   end

   def all_guests
      guests.map {|g|g.name}.to_sentence
   end

   def self.where_has_submitted(submitted) 
      where(has_submitted:submitted == "1")
   end

   def self.responded 
      where(has_submitted: true)
   end

   def self.num_responded
      responded.count
   end

   def self.num_not_responded
      where_has_submitted(1).count
   end

   def self.num_guests_responded 
      count = 0
      all.each {|g| if g.has_submitted then count = count + g.size end}
      count
   end

end
