const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast({
        title: "Хатолик",
        description: "Телефон рақамингизни киритинг",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Прямой запрос к твоей таблице allowed_phones
      const { data, error } = await supabase
        .from('allowed_phones') 
        .select('Telefon raqami') // Название колонки именно такое, как на скрине
        .eq('Telefon raqami', phone.trim())
        .maybeSingle();

      if (error) throw error;

      // Если запись найдена, разрешаем вход
      if (data) {
        localStorage.setItem('phone_auth', 'true');
        localStorage.setItem('phone_number', phone.trim());
        localStorage.setItem('phone_auth_timestamp', Date.now().toString());
        toast({
          title: "Муваффақият",
          description: "Тизимга кирдингиз",
        });
        navigate('/');
      } else {
        toast({
          title: "Рухсат берилмади",
          description: "Сиз рўйхатдан ўтмагансиз",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Хатолик",
        description: "Серверга уланишда хатолик юз берди",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
