//backbone.js������jquery.js,underscore.js,���巽�����¼��ο�����ĵ�
$(function(){

	//Model:��ʾһ��ѧ��
	var Student=Backbone.Model.extend({
		//Ĭ��ֵ
		defaults:function(){
			return{
				name:"XXX",
				age:"0",
				selected:false,
				id:Students.nextId(),
			};
		},
		
		//��ʼ����ʱ���жϣ�������õ�����ֵ�Ƿ�����ΪĬ��ֵ
		initialize:function(){
			if(!this.get("name")){
				this.set({"name":this.defaults().name});
			}
			if(!this.get("age")||!(/(^[1-9]\d*$)/.test(this.get("age")))){
				this.set({"age":this.defaults().age});
			}
		},

		//��Ǹ�ѧ���Ƿ�ѡ��
		toggle:function(){
			this.save({selected:!this.get("selected")});
		}
	});

	//Collection:Model�ļ��ϣ�������ѧ���ļ���
	var Students=Backbone.Collection.extend({
		
		model:Student,
		
		//�������ݿ⣬�õ�backbone-localstorage.js
		localStorage:new Backbone.LocalStorage("Students-Table"),

		//���ر�ѡ�е�ѧ���ļ���
		selected:function(){
			return this.filter(function(student){return student.get('selected');});
		},

		//��ÿ��ѧ��һ�����
		nextId:function(){
			if(!this.length)
				return 1;
			return this.last().get('id')+1;
		}
	});

	//����һ��ѧ�����϶���
	var Students=new Students;


	//View:�����ͼ��ʾtable�е�һ�У���һ��ѧ������Ӧһ��Model
	var StudentView=Backbone.View.extend({
		//��ʾ<tr></tr>Ԫ��
		tagName:"tr",
		
		//����Ӧģ��д��template�����У�_.template()Ϊunderscore.js�еķ���
		template:_.template($('#item-template').html()),

		//�󶨸�tr�µ��¼�
		events:{
			"click .toggle":"toggleSelect",
			"dblclick td":"edit",
			"click a.destroy":"clear",
			"blur .edit":"close"
		},

		//��ʼ����View��listenTo����model���¼�
		initialize:function(){
			//model�����仯��������Ⱦ��ͼ
			this.listenTo(this.model,'change',this.render);
			//����model
			this.listenTo(this.model,'destroy',this.remove);
		},

		//this.$elΪ��tr�ڵ�Ԫ�أ���template��Ⱦ���ýڵ㣬����model��ֵд��
		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			//������б�ѡ�У����л���ʽ
			this.$el.toggleClass('selected',this.model.get('selected'));
			return this;
		},

		//�жϸ����Ƿ�ѡ�У���Ӧmodel�е�selected����
		toggleSelect:function(){
			this.model.toggle();
		},

		//˫��td����ʽ��Ϊ�ɱ༭
		edit:function(e){
			$(e.currentTarget).addClass("editing").find("input,select").focus();
		},

		//�༭״̬��ʧȥ���㣬���޸����
		close:function(e){
			var input=$(e.currentTarget);

			if(input.attr('name')=="name"){
				if(!input.val()){
					input.val(this.model.defaults().name);
				}
				this.model.save({"name":input.val()});
			}else if(input.attr('name')=="gender"){
				this.model.save({"gender":input.val()});
			}else{
				if(!input.val()||!(/(^[1-9]\d*$)/.test(input.val()))){
					input.val(this.model.defaults().age);
				}
				this.model.save({"age":input.val()});
			}
			input.parent().removeClass("editing");
		},

		//ɾ�����е�ʱ��ɾ����Ӧmodel
		clear:function(){
			this.model.destroy();
		}
	});


	//View:�����ͼ��ʾ$("#content")��������������ѧ�����
	var AppView=Backbone.View.extend({
		el:$("#content"),

		//���½�ɾ��ѧ����Ŀ��ģ��
		statsTemplate:_.template($('#stats-template').html()),

		events:{
			"click #add-student":"addNewStudent",
			"click #clear-selected":"clearSelected",
			"click #select-all":"selectAll"
		},

		initialize:function(){
			this.allCheckbox=$("#select-all");
			this.main=$("#main");
			this.footer=$('footer');
			this.name=$("#new-name");
			this.age=$("#new-age");
			this.gender=$("#new-gender");

			//Collection������һ��Model�ʹ���add�¼�
			this.listenTo(Students,'add',this.addOne);
			//һ������fetch�����ʹ���reset�¼�
			this.listenTo(Students,'reset',this.addAll);
			//all�¼���ʾ��View�µ������¼��������������¼��ʹ���all�¼�
			this.listenTo(Students,'all',this.render);

			//�ӱ������ݿ��л�ȡ����ѧ��
			Students.fetch();
		},

		//��Ⱦ��ͼ
		render:function(){
			var selected=Students.selected().length;
			
			if(Students.length){
				this.main.show();
				this.footer.show();
				this.footer.html(this.statsTemplate({selected:selected}));
			}else{
				this.main.hide();
				this.footer.hide();
			}
			//�ж�����ѧ���Ƿ�ѡ��
			this.allCheckbox.attr("checked",selected==Students.length?true:false);
		},

		//����һ��ѧ����ͬʱ��model����StudentView��
		addOne:function(student){
			var view=new StudentView({model:student});
			//����Ⱦ���ÿһ����ӵ������
			this.$("#student-list").append(view.render().el);
		},

		//��������ѧ����ͨ��Collection.each���ε���addOne����
		addAll:function(){
			Students.each(this.addOne,this);
		},

		//����һ����ѧ��
		addNewStudent:function(){
			Students.create({name:this.name.val(),gender:this.gender.val(),age:this.age.val()});
			this.name.val('');
			this.age.val('');
			this.gender.val(1);
		},

		//ɾ��ѡ���У�_.invoke(����,����)
		clearSelected:function(){
			_.invoke(Students.selected(),'destroy');
		},

		//ѡ������
		selectAll:function(){
			var selected=this.allCheckbox.attr('checked')=="checked";
			Students.each(function(student){
				student.save({'selected':selected});
			});
		}
	});

	//����View
	var App=new AppView;
});