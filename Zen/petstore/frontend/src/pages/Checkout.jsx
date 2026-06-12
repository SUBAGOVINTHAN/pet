import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Select from 'react-select';
import { State } from 'country-state-city';

const selectStyles = (filled = false, disabled = false) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40, fontSize: 14, borderRadius: 8,
    borderColor: state.isFocused ? '#F97316' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #F97316' : 'none',
    '&:hover': { borderColor: disabled ? '#d1d5db' : '#F97316' },
    background: disabled ? '#f9fafb' : filled ? '#f0fdf4' : '#fff',
    transition: 'background 0.3s',
    cursor: disabled ? 'not-allowed' : 'default',
  }),
  option: (base, state) => ({
    ...base, fontSize: 14,
    backgroundColor: state.isSelected ? '#F97316' : state.isFocused ? '#FFF7F0' : '#fff',
    color: state.isSelected ? '#fff' : '#111',
    cursor: 'pointer',
  }),
  placeholder: base => ({ ...base, color: '#9CA3AF', fontSize: 14 }),
  singleValue:  base => ({ ...base, fontSize: 14, color: '#111' }),
  menu:         base => ({ ...base, zIndex: 9999, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }),
  menuPortal:   base => ({ ...base, zIndex: 9999 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: base => ({ ...base, color: '#6b7280', padding: '0 8px' }),
  loadingIndicator:  base => ({ ...base, color: '#F97316' }),
});

const labelStyle = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' };

const STATE_OPTIONS = State.getStatesOfCountry('IN')
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(s => ({ value: s.isoCode, label: s.name }));

const DISTRICT_MAP = {
  TN: ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanniyakumari','Karur','Krishnagiri','Madurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'].sort(),
  AP: ['Alluri Sitharama Raju','Anakapalli','Ananthapuramu','Annamayya','Bapatla','Chittoor','East Godavari','Eluru','Guntur','Kakinada','Krishna','Kurnool','Nandyal','NTR','Palnadu','Prakasam','Sri Potti Sriramulu Nellore','Sri Sathya Sai','Srikakulam','Tirupati','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'].sort(),
  KA: ['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir'].sort(),
  KL: ['Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad'].sort(),
  MH: ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'].sort(),
  GJ: ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'].sort(),
  RJ: ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar','Tonk','Udaipur'].sort(),
  UP: ['Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shrawasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi'].sort(),
  WB: ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'].sort(),
  DL: ['Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'].sort(),
};

const CITY_MAP = {
  'Ariyalur': ['Ariyalur','Andimadam','Jayankondam','Sendurai','Udayarpalayam','T.Palur','Perambalur','Thirumanur'],
  'Chengalpattu': ['Chengalpattu','Maraimalai Nagar','Tambaram','Vandalur','Guduvanchery','Urapakkam','Padappai','Singaperumalkoil','Maduranthakam','Uthiramerur'],
  'Chennai': ['Chennai','Ambattur','Avadi','Kodambakkam','Kolathur','Maduravoyal','Manali','Perambur','Royapuram','Sholinganallur','Thiruvottiyur','Tondiarpet','Velachery','Vyasarpadi'],
  'Coimbatore': ['Coimbatore','Annur','Kinathukadavu','Madukkarai','Mettupalayam','Perur','Pollachi','Sulur','Tiruppur','Valparai'],
  'Cuddalore': ['Cuddalore','Bhuvanagiri','Chidambaram','Kattumannarkoil','Kurinjipadi','Panruti','Srimushnam','Tittagudi','Vriddhachalam'],
  'Dharmapuri': ['Dharmapuri','Harur','Hosur','Morappur','Nallampalli','Palacode','Palakkodu','Pennagaram'],
  'Dindigul': ['Dindigul','Attur','Natham','Nilakottai','Oddanchatram','Palani','Reddiyarchatram','Vedasandur'],
  'Erode': ['Erode','Anthiyur','Bhavani','Gobichettipalayam','Kodumudi','Modakkurichi','Nambiyur','Perundurai','Sathyamangalam'],
  'Kallakurichi': ['Kallakurichi','Chinnasalem','Sankarapuram','Tirukoilur','Ulundurpet','Rishivandiyam'],
  'Kancheepuram': ['Kancheepuram','Cheyyar','Kancheepuram','Sriperumbudur','Uthiramerur','Walajabad'],
  'Kanniyakumari': ['Nagercoil','Colachel','Kuzhithurai','Marthandam','Padmanabhapuram','Thiruvattar','Thuckalay'],
  'Karur': ['Karur','Aravakurichi','Kadavur','Krishnarayapuram','Kulithalai','Manmangalam','Thogamalai'],
  'Krishnagiri': ['Krishnagiri','Anchetti','Bargur','Denkanikottai','Hosur','Pochampalli','Shoolagiri','Uthangarai','Veppanapalli'],
  'Madurai': ['Madurai','Kallupatti','Kottampatti','Melur','Peraiyur','Thirumangalam','Usilampatti','Vadipatti'],
  'Nagapattinam': ['Nagapattinam','Kilvelur','Kuthalam','Mayiladuthurai','Sirkali','Tharangambadi','Vedaranyam'],
  'Namakkal': ['Namakkal','Erumapatty','Kolli Hills','Mohanur','Paramathi Velur','Rasipuram','Sendamangalam','Tiruchengode'],
  'Nilgiris': ['Ooty','Coonoor','Gudalur','Kotagiri','Lovedale','Pandalur','Wellington'],
  'Perambalur': ['Perambalur','Alathur','Kurumbalur','Veppanthattai'],
  'Pudukkottai': ['Pudukkottai','Alangudi','Aranthangi','Gandarvakottai','Iluppur','Karambakkudi','Ponnamaravathi','Viralimalai'],
  'Ramanathapuram': ['Ramanathapuram','Bogalur','Emaneswaram','Kadaladi','Kamuthi','Kilakarai','Mandapam','Mudukulathur','Paramakudi','Rajasingamangalam','Rameswaram','Thiruvadanai','Tondi'],
  'Ranipet': ['Ranipet','Arani','Arcot','Kalavai','Nemili','Sholinghur','Vellore','Walajah'],
  'Salem': ['Salem','Attur','Edappadi','Gangavalli','Mettur','Omalur','Sankari','Valapady','Yercaud'],
  'Sivaganga': ['Sivaganga','Devakottai','Ilayankudi','Kallal','Karaikudi','Manamadurai','Tiruppattur'],
  'Tenkasi': ['Tenkasi','Alangulam','Kadayanallur','Sankarankovil','Shengottai','Surandai','V.K.Puram'],
  'Thanjavur': ['Thanjavur','Budalur','Kumbakonam','Orathanadu','Papanasam','Pattukkottai','Peravurani','Thiruvaiyaru','Thiruvidaimarudur'],
  'Theni': ['Theni','Andipatti','Bodinayakanur','Cumbum','Periyakulam','Uthamapalayam'],
  'Thoothukudi': ['Thoothukudi','Eral','Kayalpatnam','Kovilpatti','Ottapidaram','Sathankulam','Srivaikundam','Tiruchendur','Vilathikulam'],
  'Tiruchirappalli': ['Tiruchirappalli','Lalgudi','Manachanallur','Manapparai','Marungapuri','Musiri','Srirangam','Thottiyam','Tiruverambur','Uppiliyapuram'],
  'Tirunelveli': ['Tirunelveli','Ambasamudram','Cheranmahadevi','Manur','Nanguneri','Palayamkottai','Radhapuram','Tenkasi','Valliyur'],
  'Tirupathur': ['Tirupathur','Ambur','Jolarpet','Natrampalli','Vaniyambadi'],
  'Tiruppur': ['Tiruppur','Avinashi','Dharapuram','Kangeyam','Madathukulam','Palladam','Udumalaipettai','Uthukuli'],
  'Tiruvallur': ['Tiruvallur','Gummidipoondi','Pallipattu','Ponneri','Poonamallee','Uthukottai'],
  'Tiruvannamalai': ['Tiruvannamalai','Arni','Chetpet','Chengam','Kilpennathur','Polur','Vandavasi','Vembakkam'],
  'Tiruvarur': ['Tiruvarur','Kodavasal','Mannargudi','Needamangalam','Papanasam','Thiruthuraipoondi','Valangaiman'],
  'Vellore': ['Vellore','Anaicut','Gudiyatham','Katpadi','Pernambut','Sholinghur'],
  'Viluppuram': ['Viluppuram','Gingee','Kallakurichi','Marakanam','Tindivanam','Ulundurpet','Vanur'],
  'Virudhunagar': ['Virudhunagar','Aruppukkottai','Kariapatti','Rajapalayam','Sattur','Sivakasi','Srivilliputhur','Tiruchuli','Watrap'],
  'Visakhapatnam': ['Visakhapatnam','Bheemunipatnam','Gajuwaka','Pendurthi','Sabbavaram'],
  'East Godavari': ['Kakinada','Amalapuram','Peddapuram','Rajamahendravaram','Ramachandrapuram'],
  'West Godavari': ['Eluru','Bhimavaram','Narsapur','Palakol','Tadepalligudem'],
  'Guntur': ['Guntur','Bapatla','Narasaraopet','Ponnur','Tenali'],
  'Krishna': ['Machilipatnam','Gudivada','Vijayawada','Vuyyuru'],
  'Kurnool': ['Kurnool','Adoni','Nandyal','Yemmiganur'],
  'Chittoor': ['Tirupati','Chittoor','Madanapalle','Puttur'],
  'YSR Kadapa': ['Kadapa','Jammalamadugu','Proddatur','Rajampet'],
  'Bengaluru Urban': ['Bengaluru','Anekal','Dasarahalli','Kengeri','Mahadevapura'],
  'Mysuru': ['Mysuru','Hunsur','Krishnarajanagara','Nanjangud','Periyapatna','T.Narasipura'],
  'Dakshina Kannada': ['Mangaluru','Bantwal','Belthangady','Puttur','Sullia','Ullal'],
  'Belagavi': ['Belagavi','Athani','Bailhongal','Chikodi','Gokak','Hukkeri','Savadatti'],
  'Dharwad': ['Dharwad','Hubli','Kalaghatgi','Kalghatgi','Navalgund','Kundgol'],
  'Shivamogga': ['Shivamogga','Bhadravathi','Hosanagara','Sagar','Sorab','Tirthahalli'],
  'Thiruvananthapuram': ['Thiruvananthapuram','Attingal','Chirayinkeezhu','Nedumangad','Neyyattinkara','Varkala'],
  'Ernakulam': ['Kochi','Aluva','Kothamangalam','Muvattupuzha','Perumbavoor','Thrippunithura'],
  'Kozhikode': ['Kozhikode','Koduvally','Koyilandy','Ramanattukara','Vatakara'],
  'Thrissur': ['Thrissur','Chalakudy','Irinjalakuda','Kodungallur','Kunnamkulam','Mala'],
  'Malappuram': ['Malappuram','Mankada','Perinthalmanna','Tirur','Tiruvali'],
  'Palakkad': ['Palakkad','Alathur','Chittur','Mannarkkad','Ottapalam','Shoranur'],
  'Kollam': ['Kollam','Chavara','Kottarakkara','Punalur','Karunagappally'],
  'Kottayam': ['Kottayam','Changanacherry','Ettumanoor','Kanjirappally','Pala','Vaikom'],
  'Alappuzha': ['Alappuzha','Chengannur','Cherthala','Haripad','Kayamkulam','Mavelikkara'],
  'Kannur': ['Kannur','Iritty','Mattannur','Payyannur','Taliparamba'],
  'Wayanad': ['Kalpetta','Mananthavady','Sulthan Bathery'],
  'Idukki': ['Idukki','Munnar','Peermade','Thodupuzha'],
  'Pathanamthitta': ['Pathanamthitta','Adoor','Konni','Ranni','Thiruvalla'],
  'Kasaragod': ['Kasaragod','Hosdurg','Kanhangad','Manjeshwar'],
  'Mumbai City': ['Mumbai','Colaba','Fort','Kurla','Mahalaxmi','Worli'],
  'Mumbai Suburban': ['Andheri','Bandra','Borivali','Dahisar','Ghatkopar','Kandivali','Malad','Mulund','Santacruz','Vile Parle'],
  'Pune': ['Pune','Baramati','Bhor','Haveli','Indapur','Junnar','Khed','Maval','Mulshi','Shirur','Velhe'],
  'Nagpur': ['Nagpur','Hingna','Kamthi','Katol','Narkhed','Ramtek','Savner'],
  'Nashik': ['Nashik','Igatpuri','Malegaon','Niphad','Sinnar','Trimbak','Yeola'],
  'Thane': ['Thane','Bhiwandi','Kalyan','Murbad','Shahapur','Ulhasnagar'],
  'Aurangabad': ['Aurangabad','Gangapur','Kannad','Khuldabad','Paithan','Phulambri','Sillod','Soegaon','Vaijapur'],
  'Kolhapur': ['Kolhapur','Ajra','Bavda','Bhudargad','Chandgad','Gadhinglaj','Hatkanangle','Kagal','Karvir','Panhala','Radhanagari','Shahuwadi'],
  'Solapur': ['Solapur','Akkalkot','Barshi','Karmala','Madha','Malshiras','Mangalvedha','Mohol','Pandharpur','Sangola'],
  'Satara': ['Satara','Jaoli','Khandala','Khatav','Koregaon','Mahabaleshwar','Man','Patan','Phaltan','Wai'],
  'Ahmedabad': ['Ahmedabad','Bavla','Dhandhuka','Dholka','Mandal','Sanand','Viramgam'],
  'Surat': ['Surat','Bardoli','Kamrej','Mandvi','Mangrol','Olpad','Palsana','Umarpada','Vyara'],
  'Vadodara': ['Vadodara','Dabhoi','Karjan','Padra','Savli','Vaghodia'],
  'Rajkot': ['Rajkot','Gondal','Jasdan','Jetpur','Kotda Sangani','Lodhika','Paddhari','Wankaner'],
  'Gandhinagar': ['Gandhinagar','Dehgam','Kalol','Mansa'],
  'Jamnagar': ['Jamnagar','Dhrol','Jodiya','Kalavad','Lalpur'],
  'Jaipur': ['Jaipur','Amber','Amer','Chomu','Dudu','Kotputli','Phulera','Sanganer','Shahpura','Viratnagar'],
  'Jodhpur': ['Jodhpur','Bhopalgarh','Bilara','Luni','Osian','Phalodi','Shergarh'],
  'Udaipur': ['Udaipur','Girwa','Gogunda','Kherwara','Lasadiya','Mavli','Sarada','Vallabhnagar'],
  'Ajmer': ['Ajmer','Beawar','Kekri','Kishangarh','Masuda','Nasirabad','Pisangan','Pushkar','Sarwar'],
  'Kota': ['Kota','Digod','Itawa','Kaithoon','Ladpura','Pipalda','Ramganj Mandi','Sangod'],
  'Bikaner': ['Bikaner','Chhatargarh','Kolayat','Lunkaransar','Nokha','Poogal'],
  'Lucknow': ['Lucknow','Bakshi Ka Talab','Chinhat','Malihabad','Mohanlalganj','Sarojini Nagar'],
  'Agra': ['Agra','Bah','Etmadpur','Fatehabad','Kheragarh','Kiraoli'],
  'Kanpur Nagar': ['Kanpur','Armapur','Bilhaur','Ghatampur','Kalyanpur','Saraimeer'],
  'Varanasi': ['Varanasi','Chiraigaon','Kashi Vidyapeeth','Pindra','Rajatalab','Sewapuri'],
  'Prayagraj': ['Prayagraj','Bara','Chail','Handia','Karchhana','Koraon','Meja','Phulpur','Soraon'],
  'Meerut': ['Meerut','Hapur','Kharkhoda','Mawana','Modinagar'],
  'Ghaziabad': ['Ghaziabad','Loni','Modinagar','Muradnagar'],
  'Mathura': ['Mathura','Chhata','Govardhan','Mant','Vrindavan'],
  'Kolkata': ['Kolkata','Behala','Dum Dum','Garden Reach','Jadavpur','Kasba','New Town','Rajpur','Salt Lake'],
  'North 24 Parganas': ['Barasat','Bangaon','Basirhat','Bongaon','Habra','Kalyani','Madhyamgram','Rajarhat','Titagarh'],
  'South 24 Parganas': ['Alipore','Baruipur','Canning','Diamond Harbour','Lakshmikantapur','Mathurapur','Sonarpur'],
  'Howrah': ['Howrah','Amta','Bagnan','Domjur','Jagatballavpur','Panchla','Shyampur','Uluberia'],
  'Hooghly': ['Chinsurah','Arambag','Chandannagar','Khanakul','Pandua','Polba','Pursura','Serampore','Singur','Tarakeswar'],
  'Murshidabad': ['Berhampore','Domkal','Farakka','Jangipur','Jiaganj','Kandi','Khargram','Lalbagh','Raghunathganj'],
  'Nadia': ['Krishnanagar','Chakdah','Kalyani','Nabadwip','Ranaghat','Santipur','Tehatta'],
  'Bardhaman': ['Asansol','Durgapur','Bankura','Kalna','Katwa','Memari'],
  'New Delhi': ['New Delhi','Connaught Place','Chanakyapuri','Diplomatic Enclave'],
  'Central Delhi': ['Karol Bagh','Paharganj','Sadar Bazar'],
  'South Delhi': ['Hauz Khas','Lajpat Nagar','Malviya Nagar','Mehrauli','Nehru Place','Saket','Vasant Kunj'],
  'North Delhi': ['Civil Lines','Model Town','Rohini','Shalimar Bagh'],
  'East Delhi': ['Geeta Colony','Krishna Nagar','Laxmi Nagar','Mayur Vihar','Preet Vihar','Vivek Vihar'],
  'West Delhi': ['Janakpuri','Moti Nagar','Punjabi Bagh','Tilak Nagar','Vikaspuri'],
  'North West Delhi': ['Pitampura','Shalimar Bagh','Shakurpur','Sultanpuri'],
  'North East Delhi': ['Bhajanpura','Nand Nagri','Shahdara','Yamuna Vihar'],
  'South West Delhi': ['Dwarka','Najafgarh','Palam','Uttam Nagar'],
  'South East Delhi': ['Govindpuri','Kalkaji','Okhla','Sarita Vihar'],
  'Shahdara': ['Dilshad Garden','Gandhi Nagar','Jhilmil','Shahdara'],
};

// Inject responsive styles once
const styles = `
  .checkout-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 32px;
    align-items: start;
  }
  .checkout-summary-sticky {
    position: sticky;
    top: 90px;
  }
  .checkout-name-phone-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .checkout-location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  .checkout-summary-toggle {
    display: none;
  }
  .mobile-order-bar {
    display: none;
  }
  @media (max-width: 768px) {
    .checkout-layout {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    /* On mobile, order summary moves to top via order property */
    .checkout-form-col { order: 2; }
    .checkout-summary-col { order: 1; }
    .checkout-summary-sticky {
      position: static;
    }
    .checkout-name-phone-grid {
      grid-template-columns: 1fr;
    }
    .checkout-location-grid {
      grid-template-columns: 1fr;
    }
    .checkout-summary-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }
    .checkout-summary-items {
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .checkout-summary-items.collapsed {
      max-height: 0 !important;
    }
    .mobile-place-order-bar {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      border-top: 1px solid #eee;
      padding: 12px 16px;
      z-index: 100;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
    }
    .desktop-place-order { display: none; }
    .checkout-page-padding { padding-bottom: 80px; }
  }
  @media (min-width: 769px) {
    .mobile-place-order-bar { display: none; }
    .desktop-place-order { display: block; }
    .checkout-page-padding { padding-bottom: 0; }
  }
`;

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading,         setLoading]         = useState(false);
  const [coupon,          setCoupon]          = useState('');
  const [couponDiscount,  setCouponDiscount]  = useState(0);
  const [orderPlaced,     setOrderPlaced]     = useState(null);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions,     setCityOptions]     = useState([]);
  const [pincodeLoading,  setPincodeLoading]  = useState(false);
  const [summaryOpen,     setSummaryOpen]     = useState(false);

  const [form, setForm] = useState({
    name:           user?.name  || '',
    email:          user?.email || '',
    phone:          user?.phone || '',
    address:        '',
    state:          '',
    stateLabel:     '',
    district:       '',
    city:           '',
    pincode:        '',
    payment_method: 'razorpay',
    notes:          '',
  });

  const isTamilNadu = form.state === 'TN';
  const shipping    = isTamilNadu ? 0 : 99;
  const tax         = (cartTotal - couponDiscount) * 0.18;
  const total       = cartTotal - couponDiscount + shipping + tax;
  const estimatedTotal = cartTotal - couponDiscount + 99 + (cartTotal - couponDiscount) * 0.18;

  useEffect(() => {
    if (!form.state) { setDistrictOptions([]); setCityOptions([]); return; }
    const list = (DISTRICT_MAP[form.state] || []).map(d => ({ value: d, label: d }));
    setDistrictOptions(list);
  }, [form.state]);

  useEffect(() => {
    if (!form.district) { setCityOptions([]); return; }
    const cities = (CITY_MAP[form.district] || [])
      .sort((a, b) => a.localeCompare(b))
      .map(c => ({ value: c, label: c }));
    setCityOptions(cities);
  }, [form.district]);

  useEffect(() => {
    if (!form.city) return;
    const fetchPincode = async () => {
      setPincodeLoading(true);
      try {
        const res  = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(form.city)}`);
        const data = await res.json();
        if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const pos = data[0].PostOffice;
          let match = pos.find(po =>
            po.State.toLowerCase()    === form.stateLabel.toLowerCase() &&
            po.District.toLowerCase() === form.district.toLowerCase()
          );
          if (!match) match = pos.find(po => po.State.toLowerCase() === form.stateLabel.toLowerCase());
          if (!match) match = pos[0];
          setForm(f => ({ ...f, pincode: match.Pincode }));
        } else {
          const res2  = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(form.district)}`);
          const data2 = await res2.json();
          if (data2[0]?.Status === 'Success' && data2[0].PostOffice?.length > 0) {
            const match = data2[0].PostOffice.find(po =>
              po.State.toLowerCase() === form.stateLabel.toLowerCase()
            ) || data2[0].PostOffice[0];
            setForm(f => ({ ...f, pincode: match.Pincode }));
          } else {
            setForm(f => ({ ...f, pincode: '' }));
          }
        }
      } catch {
        setForm(f => ({ ...f, pincode: '' }));
      } finally {
        setPincodeLoading(false);
      }
    };
    fetchPincode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.city]);

  const handleStateChange = option => setForm(f => ({
    ...f, state: option?.value || '', stateLabel: option?.label || '',
    district: '', city: '', pincode: '',
  }));

  const handleDistrictChange = option => setForm(f => ({
    ...f, district: option?.value || '', city: '', pincode: '',
  }));

  const handleCityChange = option => setForm(f => ({
    ...f, city: option?.value || '', pincode: '',
  }));

  const loadRazorpay = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script    = document.createElement('script');
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubmit = async () => {
    const { name, phone, address, city, state, district, pincode } = form;
    if (!name || !phone || !address || !state || !district || !city || !pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Razorpay failed to load. Check your internet.');
        setLoading(false);
        return;
      }

      const { data: rpOrder } = await api.post('/payment/create-order', { amount: total });

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      rpOrder.amount,
        currency:    'INR',
        name:        'Dot Pet Foods',
        description: 'Pet Store Order',
        order_id:    rpOrder.orderId,
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: form.phone.length === 10 ? `+91${form.phone}` : form.phone,
        },
        config: { display: { hide: [{ method: 'paylater' }] } },
        theme: { color: '#F97316' },

        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            const { data } = await api.post('/orders', {
              shipping:          { ...form, state: form.stateLabel },
              payment_method:    'razorpay',
              payment_id:        response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              notes:             form.notes,
              coupon_code:       coupon || null,
            });

            setOrderPlaced(data);
            clearCart();
          } catch {
            toast.error(
              'Payment done but order save failed. Contact support with payment ID: ' +
              response.razorpay_payment_id
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setLoading(false);
          },
          escape:        true,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // ── Order success screen ────────────────────────────────────────────────────
  if (orderPlaced) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: 480, margin: '0 auto' }}>
      <CheckCircle size={80} color="#10B981" style={{ margin: '0 auto 20px', display: 'block' }} />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order Placed!</h2>
      <p style={{ color: '#555', marginBottom: 8 }}>
        Your order <strong>{orderPlaced.order_number}</strong> has been placed successfully.
      </p>
      <p style={{ color: '#9CA3AF', marginBottom: 28, fontSize: 14 }}>
        We'll send you updates as your order progresses.
      </p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/orders')}>
        Track My Orders
      </button>
    </div>
  );

  // ── Input helper ────────────────────────────────────────────────────────────
  const inp = (label, key, type = 'text', required = true) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: 'red' }}> *</span>}</label>
      <input
        className="input" type={type} value={form[key]}
        maxLength={key === 'phone' ? 10 : undefined}
        onInput={e => { if (key === 'phone') e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ fontSize: 16 /* prevents iOS zoom on focus */ }}
      />
    </div>
  );

  // ── Order summary content (shared between sidebar & mobile panel) ───────────
  const OrderSummaryContent = () => (
    <>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
        {cartItems.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: '#555', marginRight: 8, flex: 1 }}>{i.name} × {i.quantity}</span>
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₹{((i.discount_price || i.price) * i.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #eee', paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: '#555' }}>Subtotal</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>

        {couponDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#10B981' }}>
            <span>Discount</span>
            <span>-₹{couponDiscount.toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: '#555' }}>Shipping</span>
          <div style={{ textAlign: 'right' }}>
            {!form.state ? (
              <span style={{ color: '#9CA3AF', fontSize: 12 }}>TN: Free | Others: ₹99</span>
            ) : (
              <span style={{ fontWeight: 600, color: isTamilNadu ? '#10B981' : '#1C1C1C' }}>
                {isTamilNadu ? 'FREE 🎉' : '₹99'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: '#555' }}>GST (18%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, borderTop: '1.5px dashed #eee', paddingTop: 12 }}>
          <span>Total</span>
          <span style={{ color: '#F97316' }}>
            {!form.state
              ? `₹${estimatedTotal.toFixed(2)}*`
              : `₹${total.toFixed(2)}`}
          </span>
        </div>

        {!form.state && (
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: -4 }}>
            * Estimated. Select state for exact amount.
          </p>
        )}
      </div>
    </>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      <div className="container section checkout-page-padding" style={{ paddingTop: 24 }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Checkout</h1>

        <div className="checkout-layout">

          {/* ── Left: Form ── */}
          <div className="checkout-form-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Shipping Information */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Shipping Information</h3>

              <div className="checkout-name-phone-grid">
                {inp('Full Name', 'name')}
                {inp('Phone', 'phone', 'tel')}
              </div>

              <div style={{ marginTop: 16 }}>{inp('Email', 'email', 'email')}</div>
              <div style={{ marginTop: 16 }}>{inp('Address', 'address')}</div>

              <div className="checkout-location-grid">
                <div>
                  <label style={labelStyle}>State <span style={{ color: 'red' }}>*</span></label>
                  <Select
                    options={STATE_OPTIONS}
                    value={form.state ? { value: form.state, label: form.stateLabel } : null}
                    onChange={handleStateChange}
                    placeholder="Search state..."
                    isClearable isSearchable
                    menuPortalTarget={document.body}
                    styles={selectStyles(!!form.state, false)}
                  />
                  {form.state && (
                    <div style={{
                      marginTop: 6, fontSize: 11, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 6, display: 'inline-block',
                      background: isTamilNadu ? '#D1FAE5' : '#FEF3C7',
                      color:      isTamilNadu ? '#065F46' : '#92400E',
                    }}>
                      {isTamilNadu ? '🎉 Free shipping!' : '📦 ₹99 shipping'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>District <span style={{ color: 'red' }}>*</span></label>
                  <Select
                    options={districtOptions}
                    value={form.district ? { value: form.district, label: form.district } : null}
                    onChange={handleDistrictChange}
                    placeholder={form.state ? 'Search district...' : 'Select state first'}
                    isClearable isSearchable
                    isDisabled={!form.state}
                    menuPortalTarget={document.body}
                    styles={selectStyles(!!form.district, !form.state)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>City <span style={{ color: 'red' }}>*</span></label>
                  <Select
                    options={cityOptions}
                    value={form.city ? { value: form.city, label: form.city } : null}
                    onChange={handleCityChange}
                    placeholder={
                      !form.state    ? 'Select state first'    :
                      !form.district ? 'Select district first' :
                      'Search city...'
                    }
                    isClearable isSearchable
                    isDisabled={!form.district}
                    menuPortalTarget={document.body}
                    styles={selectStyles(!!form.city, !form.district)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Pincode <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input" type="text" maxLength={6}
                      value={form.pincode}
                      placeholder={pincodeLoading ? 'Fetching...' : 'Auto-filled / Enter manually'}
                      onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/[^0-9]/g, '') }))}
                      style={{
                        background: form.pincode ? '#f0fdf4' : undefined,
                        transition: 'background 0.3s',
                        paddingRight: pincodeLoading ? 36 : undefined,
                        fontSize: 16,
                      }}
                    />
                    {pincodeLoading && (
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#F97316' }}>⏳</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  className="input" rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical', fontSize: 16 }}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Payment Method</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px', border: '2px solid #F97316',
                borderRadius: 10, background: '#FFF7F0',
              }}>
                <img
                  src="https://razorpay.com/favicon.ico"
                  alt="Razorpay" width={24} height={24}
                  style={{ borderRadius: 4, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Pay via Razorpay</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    UPI · Cards · NetBanking · Wallets
                  </div>
                </div>
                <span style={{
                  fontSize: 11, background: '#D1FAE5', color: '#065F46',
                  padding: '3px 8px', borderRadius: 20, fontWeight: 700,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  🔒 Secure
                </span>
              </div>
            </div>

            {/* Desktop Place Order button (inside form col, hidden on mobile) */}
            <div className="desktop-place-order" style={{ display: 'none' }} />
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="checkout-summary-col">
            <div className="card checkout-summary-sticky" style={{ padding: 20 }}>

              {/* Mobile: collapsible header */}
              <div
                className="checkout-summary-toggle"
                onClick={() => setSummaryOpen(o => !o)}
                style={{ marginBottom: summaryOpen ? 16 : 0 }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Order Summary</span>
                  <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 8 }}>
                    ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#F97316', fontSize: 16 }}>
                    {!form.state ? `₹${estimatedTotal.toFixed(0)}*` : `₹${total.toFixed(0)}`}
                  </span>
                  {summaryOpen ? <ChevronUp size={18} color="#9CA3AF" /> : <ChevronDown size={18} color="#9CA3AF" />}
                </div>
              </div>

              {/* Desktop: always-visible header */}
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }} className="checkout-summary-desktop-title">
                Order Summary
              </h3>

              <div
                className={`checkout-summary-items${summaryOpen ? '' : ' collapsed'}`}
                style={{ maxHeight: summaryOpen ? 600 : undefined }}
              >
                <OrderSummaryContent />
              </div>

              {/* Desktop place order */}
              <button
                className="btn btn-primary desktop-place-order"
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 20, fontSize: 15 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : '🐾 Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="mobile-place-order-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Total</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#F97316' }}>
              {!form.state ? `₹${estimatedTotal.toFixed(0)}*` : `₹${total.toFixed(0)}`}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ flex: 2, justifyContent: 'center', padding: '12px 16px', fontSize: 15 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Placing...' : '🐾 Place Order'}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .checkout-summary-desktop-title { display: block !important; }
          .checkout-summary-items { max-height: none !important; }
        }
        @media (max-width: 768px) {
          .checkout-summary-desktop-title { display: none !important; }
          .desktop-place-order { display: none !important; }
        }
      `}</style>
    </>
  );
}